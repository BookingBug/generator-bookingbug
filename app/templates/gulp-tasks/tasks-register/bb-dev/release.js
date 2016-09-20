(function () {
    'use strict';

    var runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('release', releaseTask);
        gulp.task('release:watch', releaseWatchTask);

        function releaseTask(cb) {

            var tasks = [
                'clean',
                'bower-prepare',
                'bower-install',
                'copy',
                'scripts:vendors',
                'scripts:lazy',
                'scripts:client',
                'templates',
                'stylesheets:vendors',
                'stylesheets:client',
                'fonts',
                'images',
                'www',
                cb
            ];
            if (configuration.projectConfig.local_sdk === true) {
                tasks = ['build-sdk'].concat(tasks);
            }
            runSequence.apply(null, tasks);
        }

        function releaseWatchTask(cb) {

            runSequence(
                'release',
                'watch',
                'watch-sdk',
                cb
            );
        }
    };

}).call(this);
