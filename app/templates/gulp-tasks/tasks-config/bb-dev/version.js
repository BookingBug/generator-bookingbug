(function () {
  'use strict';

  var bump = require('gulp-bump');
  var git = require('gulp-git');
  var filter = require('gulp-filter');
  var tag_version = require('gulp-tag-version');

  module.exports = function (gulp, configuration) {

    gulp.task('patch', function() {bumpTask('patch');});
    gulp.task('minor', function() {bumpTask('minor');});
    gulp.task('major', function() {bumpTask('major');});
    gulp.task('prerelease', function() {bumpTask('prerelease');});

    function bumpTask(type) {
      return gulp.src(['./package.json', './bower.json'])
        .pipe(bump({type: type}))
        .pipe(gulp.dest('./'))
        .pipe(git.commit('Bump version'))
        .pipe(filter('package.json'))
        .pipe(tag_version())
        .on('end', function() {
          git.push('origin', 'master', {args: ' --tags'});
        });
    }

  };

}).call(this);
