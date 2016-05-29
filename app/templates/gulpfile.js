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

gulp.task('javascripts', function() {
  src = mainBowerFiles({filter: new RegExp('.js$')});
  src.push('src/javascripts/**/*');
  return gulp.src(src)
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

var sassOptions = {
  includePaths: [path.join(__dirname, 'bower_components/bootstrap-sass-official/assets/stylesheets')],
  errLogToConsole: true
};

gulp.task('stylesheets', function() {
  src = mainBowerFiles({filter: new RegExp('.css')});
  src.push('src/stylesheets/main.scss');
  return gulp.src(src)
    .pipe(gulpif(/.*scss$/, sass(sassOptions)))
    .pipe(template(config))
    .pipe(flatten())
    .pipe(concat('booking-widget.css'))
    .pipe(gulp.dest('release'));
});

gulp.task('fonts', function() {
  return gulp.src('src/fonts/*')
    .pipe(flatten())
    .pipe(gulp.dest('release/fonts'));
});

gulp.task('watch', ['assets'], function() {
  gulp.watch(['./src/javascripts/*', '!./**/*~'], ['javascripts']);
  gulp.watch(['./src/stylesheets/*', '!./**/*~'], ['stylesheets']);
  gulp.watch(['./src/images/*', '!./**/*~'], ['images']);
  gulp.watch(['./src/templates/*', '!./**/*~'], ['templates']);
  gulp.watch(['./src/www/*', '!./**/*~'], ['www']);
  gulp.watch(['./src/fonts/*', '!./**/*~'], ['fonts']);
});

gulp.task('webserver', ['assets'], function() {
  return connect.server({
    root: [
      'release',
      '../bookingbug-angular/release'
    ],
    port: 8000
  });
});

gulp.task('assets', ['clean', 'templates', 'javascripts', 'stylesheets', 'images', 'www', 'fonts']);

gulp.task('default', ['assets', 'watch', 'webserver'], function(){
    setTimeout(function(){console.log("All tasks done!");}, 30);
});
