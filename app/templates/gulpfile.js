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
    argv = require('yargs').argv;
    replace = require('gulp-replace');
    template = require('gulp-template');
    sass = require('gulp-sass');
    mainBowerFiles = require('main-bower-files');
    uglify = require('gulp-uglify');
var bower = require('gulp-bower');
    path = require('path')

var devConfig = './config.dev.json'
    stagingConfig = './config.staging.json'
    prodConfig = './config.json'

gulp.task('clean', function(cb) {
  del.sync(['release']);
  cb()
});

/*gulp.task('repo_clone', function(cb) {
  git.clone("https://github.com/BookingBug/bookingbug-angular.git", {cwd: "./src/"}, function(err){
    //console.log(err);
    cb(null);
  });
});*/
gulp.task('www', function() {
  return gulp.src(['src/www/*'])
      .pipe(gulpif(argv.env == 'development' || argv.env == 'dev',
                   template(require(devConfig)),
                   gulpif(argv.env == 'production' || argv.production,
                          template(require(prodConfig)),
                          template(require(stagingConfig)))))
      .pipe(gulp.dest('release'));
});

gulp.task('javascripts', ['bower', 'templates'], function() {
  src = mainBowerFiles({filter: new RegExp('.js$')})
  src.push('src/javascripts/**/*')
  return gulp.src(src)
    .pipe(gulpif(/.*coffee$/, coffee().on('error', function(e) {
      gutil.log(e)
      this.emit('end')
    })))
    .pipe(gulpif(argv.env != 'development' && argv.env != 'dev',
            uglify({mangle: false}))).on('error', gutil.log)
    .pipe(concat('booking-widget.js'))
    .pipe(gulp.dest('release'));
});

gulp.task('templates', ['bower'], function() {
  return gulp.src('src/templates/**/*.html')
    .pipe(templateCache('booking-widget-templates.js', {module: 'BB'}))
    .pipe(gulp.dest('src/javascripts'));
});

gulp.task('images', function() {
  return gulp.src('src/images/*')
    .pipe(flatten())
    .pipe(gulp.dest('release/images'));
});

function filterStylesheets(path) {
  if (path.match(new RegExp('.css$')) && 
     !path.match(new RegExp('<%= appType %>.css$'))){
    return true;
  } else {
    return false;
  }
}

gulp.task('stylesheets', ['bower'], function() {
  src = mainBowerFiles({filter: filterStylesheets})
  src.push('src/<%= appType %>/stylesheets/main.scss')
  return gulp.src(src)
    .pipe(gulpif(/.*scss$/, sass({errLogToConsole: true})))
    .pipe(gulpif(argv.env == 'development' || argv.env == 'dev',
       template(require(devConfig)),
       template(require(prodConfig))))
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
  return gulp.watch(['./src/**/*', '!./**/*~'], ['assets']);
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

gulp.task('bower', function() {
  return bower();
});

gulp.task('assets', ['clean', 'templates', 'javascripts', 'stylesheets', 'images', 'www', 'fonts'])

gulp.task('default', ['assets', 'watch', 'webserver'], function(){
    setTimeout(function(){console.log("All tasks done!");}, 30);
});
