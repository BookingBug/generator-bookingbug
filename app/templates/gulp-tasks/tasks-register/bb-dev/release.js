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
                'config',
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
            if (configuration.projectConfig.build.local_sdk === true) {
                tasks = ['build-sdk'].concat(tasks);
            }
            runSequence.apply(null, tasks);
        }

        function releaseWatchTask(cb) {

            var tasks = [
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

}).call(this);
