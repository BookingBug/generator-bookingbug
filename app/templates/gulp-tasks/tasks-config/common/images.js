(function () {
    'use strict';

    const gulpLiveReload = require('gulp-livereload');
    const path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('images', imagesTask);

        function imagesTask() {

            let clientImages = path.join(configuration.projectRootPath, 'src/images/**/*.*');
            let dest = path.join(configuration.projectReleasePath, 'images');

            return gulp.src(clientImages)
                .pipe(gulp.dest(dest))
                .pipe(gulpLiveReload())
                ;
        }
    };

})();
