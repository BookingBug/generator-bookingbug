(function () {
    'use strict';

    var runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('release', releaseTask);
        gulp.task('release:watch', releaseWatchTask);


        function releaseTask(cb) {

            runSequence.call(
                null,
                'clean',
                'bower-install',
                'copy',
                'config',
                'templates',
                'stylesheets:vendors',
                'stylesheets:client',
                'fonts',
                'images',
                'scripts:vendors',
                'scripts:client',
                'www',
                cb
            );
        }


        function releaseWatchTask(cb) {

            runSequence(
                'release',
                'watch',
                cb
            );
        }
    };

}).call(this);
