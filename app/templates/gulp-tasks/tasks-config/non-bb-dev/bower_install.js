(function () {
    'use strict';

    var gulpBower = require('gulp-bower');

    module.exports = function (gulp, configuration) {

        gulp.task('bower-install', bowerInstallTask);

        function bowerInstallTask() {

            return gulpBower({
                cwd: configuration.projectRootPath,
                directory: 'bower_components'
            });
        }
    };

}).call(this);
