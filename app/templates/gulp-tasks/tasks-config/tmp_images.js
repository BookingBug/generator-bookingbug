(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('tmp-images', imagesTask);
        gulp.task('tmp-images:watch', imagesWatchTask);

        var args = require('../helpers/args.js');
        var gulpFlatten = require('gulp-flatten');

        function imagesTask() {

            var src = path.join(plugins.config.projectRootPath, 'src/images/*.*');
            var dest = path.join(plugins.config.projectTmpPath, 'images');

            return gulp.src(src)
                .pipe(gulpFlatten())
                .pipe(gulp.dest(dest));
        }

        function imagesWatchTask(cb) {
            var imagesSrcGlob = path.join(plugins.config.projectRootPath, 'src/images/*.*');

            gulp.watch(imagesSrcGlob, ['tmp-images']);

            gulp.watch([path.join(plugins.config.sdkRootPath, 'src/admin/images/**/*')], ['build-sdk:admin:images', 'webserver:reload']);
            gulp.watch([path.join(plugins.config.sdkRootPath, 'src/admin-dashboard/images/**/*')], ['build-sdk:admin-dashboard:images', 'webserver:reload']);
            gulp.watch([path.join(plugins.config.sdkRootPath, 'src/public-booking/images/**/*')], ['build-sdk:public-booking:images', 'webserver:reload']);
            cb();
        }
    };

}).call(this);
