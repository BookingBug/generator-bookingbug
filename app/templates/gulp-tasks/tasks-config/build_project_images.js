(function () {
    module.exports = function (gulp, plugins, path) {

        var args = require('../helpers/args.js');
        var gulpFlatten = require('gulp-flatten');

        gulp.task('build-project-images', imagesTask);
        gulp.task('build-project-images:watch', imagesWatchTask);

        function imagesTask() {

            var src = path.join(plugins.config.projectRootPath, 'src/images/*.*');
            var dest = path.join(plugins.config.projectTmpPath, 'images');

            return gulp.src(src)
                .pipe(gulpFlatten())
                .pipe(gulp.dest(dest));
        }

        function imagesWatchTask(cb) {
            var imagesSrcGlob = path.join(plugins.config.projectRootPath, 'src/images/*.*');

            gulp.watch(imagesSrcGlob, ['build-project-images']);

            gulp.watch(['src/admin/images/**/*'], ['build-sdk:admin:images']);
            gulp.watch(['src/admin-dashboard/images/**/*'], ['build-sdk:admin-dashboard:images']);
            gulp.watch(['src/public-booking/images/**/*'], ['build-sdk:public-booking:images']);
            cb();
        }
    };

}).call(this);
