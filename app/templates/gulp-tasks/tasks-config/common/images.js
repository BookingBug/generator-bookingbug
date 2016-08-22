(function () {
    'use strict';

    var gulpConnect = require('gulp-connect');
    var gulpFlatten = require('gulp-flatten');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('images', imagesTask);

        function imagesTask() {

            var clientImages = path.join(configuration.projectRootPath, 'src/images/*.*');
            var dest = path.join(configuration.projectReleasePath, 'images');

            return gulp.src(clientImages)
                .pipe(gulpFlatten())
                .pipe(gulp.dest(dest))
                .pipe(gulpConnect.reload())
                ;
        }
    };

}).call(this);
