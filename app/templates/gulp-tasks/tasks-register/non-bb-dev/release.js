(function () {
    'use strict';

    var runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('release', releaseTask);
        gulp.task('release:watch', releaseWatchTask);

        function releaseTask(cb) {

            var tasks = [
                'clean',
                'bower-install',
                'copy',
                'scripts:vendors',
                'scripts:client',
                'templates',
                'stylesheets:vendors',
                'stylesheets:client',
                'fonts',
                'images',
                'www',
                cb
            ];
            runSequence.apply(null, tasks);
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
