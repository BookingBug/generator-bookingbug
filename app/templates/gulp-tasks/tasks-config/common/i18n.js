(function () {
    'use strict';

    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('i18n', i18nTask);

        function i18nTask(cb) {

            var angulari18nSrc = path.join(configuration.projectRootPath, 'bower_components', 'angular-i18n');
            var angulari18nDest = path.join(configuration.projectReleasePath, 'angular-i18n');

            gulp.src(angulari18nSrc + '/**/*')
                .pipe(gulp.dest(angulari18nDest));

            cb()
        }
    };

}).call(this);
