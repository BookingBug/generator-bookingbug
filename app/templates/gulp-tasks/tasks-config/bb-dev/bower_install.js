(function () {
    'use strict';

    var gulpBower = require('gulp-bower');

    module.exports = function (gulp, configuration) {

        gulp.task('bower-install', bowerInstallTask);

        function bowerInstallTask() {

            return gulpBower({
                cwd: configuration.projectTmpPath,
                directory: '../bower_components'
            });
        }
    };

}).call(this);
