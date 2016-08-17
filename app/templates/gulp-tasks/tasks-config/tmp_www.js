(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-www', wwwTask);

        var gulpTemplate = require('gulp-template');
        var path = require('path');

        function wwwTask() {

            var src = path.join(configuration.projectRootPath, 'src/www/*.*');

            return gulp.src(src)
                .pipe(gulpTemplate(configuration.projectConfig))
                .pipe(gulp.dest(configuration.projectTmpPath));
        }
    };

}).call(this);
