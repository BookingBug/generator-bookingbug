(function () {
    'use strict';

    const runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('release', releaseTask);
        gulp.task('release:watch', releaseWatchTask);

        function releaseTask(cb) {

            if (configuration.projectConfig.build.local_sdk === true) {
                runSequence(
                    'build-sdk',
                    'clean',
                    'bower-prepare',
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
                return;
            }
            runSequence(
                'clean',
                'bower-prepare',
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

            let tasks = [
                'release',
                'watch'
            ];

            if (configuration.projectConfig.build.local_sdk === true) {
                tasks.push('watch-sdk');
            }

            tasks.push(cb);

            runSequence.apply(null, tasks);
        }
    };

})();
