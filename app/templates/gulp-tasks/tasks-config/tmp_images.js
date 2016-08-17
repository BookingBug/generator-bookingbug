(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-images', imagesTask);
        gulp.task('tmp-images:watch', imagesWatchTask);

        var args = require('../helpers/args.js');
        var gulpFlatten = require('gulp-flatten');
        var path = require('path');
        var runSequence = require('run-sequence');

        function imagesTask() {

            var src = path.join(configuration.projectRootPath, 'src/images/*.*');
            var dest = path.join(configuration.projectTmpPath, 'images');

            return gulp.src(src)
                .pipe(gulpFlatten())
                .pipe(gulp.dest(dest));
        }

        function imagesWatchTask(cb) {

            gulp.watch(configuration.projectRootPath + '/src/images/*.*', function () {
                runSequence('tmp-images', 'webserver:reload');
            });

            gulp.watch([configuration.sdkRootPath + '/src/admin/images/**/*'], function () {
                runSequence('build-sdk:admin:images', 'webserver:reload');
            });

            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/images/**/*'], function () {
                runSequence('build-sdk:admin-dashboard:images', 'webserver:reload');
            });

            gulp.watch([configuration.sdkRootPath + '/src/public-booking/images/**/*'], function () {
                runSequence('build-sdk:public-booking:images', 'webserver:reload');
            });

            cb();
        }
    };

}).call(this);
