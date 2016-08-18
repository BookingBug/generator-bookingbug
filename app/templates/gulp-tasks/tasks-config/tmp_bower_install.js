(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-bower-install', bowerInstallTask);

        var gulpBower = require('gulp-bower');

        function bowerInstallTask() {

            return gulpBower({
                cwd: configuration.projectTmpPath,
                directory: '../bower_components'
            });
        }
    };

}).call(this);
