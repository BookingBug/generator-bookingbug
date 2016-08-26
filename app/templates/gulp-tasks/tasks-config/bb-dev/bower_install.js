(function () {
    'use strict';

    var gulpBower = require('gulp-bower');

    module.exports = function (gulp, configuration) {

        gulp.task('bower-install', bowerInstallTask);

        function bowerInstallTask() {

            return gulpBower({
                cwd: configuration.projectTmpPath,
                directory: '../bower_components',
                interactive: false
            }).on('error', function () {
                console.log('Please run "bower install" and fix resolutions by prefixing your choices with "!".');
                process.exit(1);
            });
        }
    };

}).call(this);
