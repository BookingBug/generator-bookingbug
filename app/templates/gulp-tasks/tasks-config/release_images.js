(function () {
    'use strict';

    var args = require('../helpers/args.js');
    var gulpFlatten = require('gulp-flatten');
    var path = require('path');
    var runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('release-images', imagesTask);
        gulp.task('release-images:watch', imagesWatchTask);

        function imagesTask() {

            var clientImages = path.join(configuration.projectRootPath, 'src/images/*.*');
            var dest = path.join(configuration.projectTmpPath, 'images');

            return gulp.src(clientImages)
                .pipe(gulpFlatten())
                .pipe(gulp.dest(dest));
        }

        function imagesWatchTask(cb) {

            gulp.watch(configuration.projectRootPath + '/src/images/*.*', function () {
                runSequence('release-images', 'webserver:reload');
            });

            sdkImagesWatch();

            cb();
        }

        function sdkImagesWatch() {
            if (configuration.projectConfig.local_sdk !== true) {
                return;
            }

            gulp.watch([configuration.sdkRootPath + '/src/admin/images/**/*'], function () {
                runSequence('build-sdk:admin:images', 'webserver:reload');
            });

            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/images/**/*'], function () {
                runSequence('build-sdk:admin-dashboard:images', 'webserver:reload');
            });

            gulp.watch([configuration.sdkRootPath + '/src/public-booking/images/**/*'], function () {
                runSequence('build-sdk:public-booking:images', 'webserver:reload');
            });
        }
    };

}).call(this);
