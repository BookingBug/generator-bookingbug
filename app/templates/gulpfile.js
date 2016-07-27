var gulp = require('gulp');
    coffee = require('gulp-coffee');
    concat = require('gulp-concat');
    gulpif = require('gulp-if');
    gutil = require('gulp-util');
    del = require('del');
    connect = require('gulp-connect');
    templateCache = require('gulp-angular-templatecache');
    rename = require('gulp-rename');
    flatten = require('gulp-flatten');
    promptly = require('promptly');
    replace = require('gulp-replace');
    template = require('gulp-template');
    sass = require('gulp-sass');
    mainBowerFiles = require('main-bower-files');
    uglify = require('gulp-uglify');
    path = require('path');
    sourcemaps = require('gulp-sourcemaps');
    plumber = require('gulp-plumber');
    cssSelectorLimit = require('gulp-css-selector-limit');
    modRewrite = require('connect-modrewrite');
    open = require('gulp-open');

var config = require('./config.json');

gulp.task('clean', function(cb) {
  del.sync(['release']);
  cb();
});

gulp.task('www', function() {
  return gulp.src(['src/www/*'])
      .pipe(template(config))
      .pipe(gulp.dest('release'));
});

gulp.task('dependency-javascripts', function() {
  return gulp.src(mainBowerFiles({filter: new RegExp('.js$')}))
    .pipe(uglify({mangle: false}).on('error', gutil.log))
    .pipe(concat('booking-widget-dependencies.js'))
    .pipe(gulp.dest('release'));
});

gulp.task('javascripts', function() {
  return gulp.src('src/javascripts/**/*')
    .pipe(gulpif(/.*coffee$/, coffee().on('error', function(e) {
      gutil.log(e);
      this.emit('end');
    })))
    .pipe(uglify({mangle: false}).on('error', gutil.log))
    .pipe(concat('booking-widget.js'))
    .pipe(gulp.dest('release'));
});

gulp.task('templates', function() {
  return gulp.src('src/templates/**/*.html')
    .pipe(templateCache('booking-widget-templates.js', {module: 'BB'}))
    .pipe(gulp.dest('release'));
});

gulp.task('images', function() {
  return gulp.src('src/images/*')
    .pipe(flatten())
    .pipe(gulp.dest('release/images'));
});

function filterStylesheets(path) {
  return (
    path.match(new RegExp('.css$'))
    &&
    !path.match(new RegExp('(bower_components\/bookingbug-angular-).+(\.css)'))
    &&
    path.indexOf('boostrap.') == -1
  );
}

gulp.task('dependency-stylesheets', function() {
  return gulp.src(mainBowerFiles({ includeDev: true, filter: filterStylesheets }))
    .pipe(concat('booking-widget-dependencies.css'))
    .pipe(gulp.dest('release'));
});

gulp.task('stylesheets', function() {
  return gulp.src('src/stylesheets/main.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({
      includePaths: ['bower_components/bootstrap-sass/assets/stylesheets'],
      outputStyle: 'compressed',
      errLogToConsole: true
    }))
    .pipe(concat('booking-widget.css'))
    .pipe(cssSelectorLimit.reporter('fail'))
    .pipe(sourcemaps.write('maps', { includeContent: false }))
    .pipe(gulp.dest('release'));
});

gulp.task('fonts', function() {
  return gulp.src('src/fonts/*')
    .pipe(flatten())
    .pipe(gulp.dest('release/fonts'));
});

gulp.task('dependencies', ['dependency-javascripts', 'dependency-stylesheets']);

gulp.task('watch', ['assets'], function() {
  gulp.watch(mainBowerFiles(), ['dependencies'])
  gulp.watch(['./src/javascripts/*', '!./**/*~'], ['javascripts']);
  gulp.watch(['./src/stylesheets/*', '!./**/*~'], ['stylesheets']);
  gulp.watch(['./src/images/*', '!./**/*~'], ['images']);
  gulp.watch(['./src/templates/*', '!./**/*~'], ['templates']);
  gulp.watch(['./src/www/*', '!./**/*~'], ['www']);
  gulp.watch(['./src/fonts/*', '!./**/*~'], ['fonts']);
  gulp.watch(['./release/*'], ['reload']);
});

gulp.task('webserver', ['assets'], function() {
  return connect.server({
    root: 'release',
    port: config.server_port,
    livereload: true,
    middleware: function(connect, options) {
      var middleware = [];
      //1. the rules that shape our mod-rewrite behavior
      var rules = [
        '!\\.html|\\.js|\\.css|\\.svg|\\woff|\\ttf|\\eot|\\woff2|\\.jp(e?)g|\\.png|\\.gif$ /index.html'
      ];
      middleware.push(modRewrite(rules));
      //2. original middleware behavior
      var base = options.root;
      if (!Array.isArray(base)) {
        base = [base];
      }
      base.forEach(function(path) {
        console.log(path);
        middleware.push(connect.static(path));
      });
      return middleware;
    }
  });
});

gulp.task('openbrowser', ['webserver'], function() {
  return gulp.src('')
    .pipe(open({ uri: 'http://localhost:' + config.server_port + '/new_booking.html' }));
});

gulp.task('reload', function() {
  return gulp.src('./release/*')
    .pipe(connect.reload());
});

gulp.task('assets', ['clean', 'templates', 'dependencies', 'javascripts', 'stylesheets', 'images', 'www', 'fonts']);

gulp.task('default', ['assets', 'watch', 'openbrowser'], function(){
    setTimeout(function(){console.log("All tasks done!");}, 30);
});
