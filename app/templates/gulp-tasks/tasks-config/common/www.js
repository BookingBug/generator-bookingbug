(function () {
    'use strict';

    const gulpLiveReload = require('gulp-livereload');
    const gulpTemplate = require('gulp-template');
    const path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('www', wwwTask);

        function wwwTask() {

            let src = path.join(configuration.projectRootPath, 'src/www/*.*');

            return gulp.src(src)
                .pipe(gulpTemplate(configuration.projectConfig))
                .pipe(gulp.dest(configuration.projectReleasePath))
                .pipe(gulpLiveReload())
                ;
        }
    };

})();
