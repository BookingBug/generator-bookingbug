(function () {
    'use strict';

    var gulpTemplate = require('gulp-template');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('www', wwwTask);

        function wwwTask() {

            var src = path.join(configuration.projectRootPath, 'src/www/*.*');

            return gulp.src(src)
                .pipe(gulpTemplate(configuration.projectConfig))
                .pipe(gulp.dest(configuration.projectReleasePath));
        }
    };

}).call(this);
