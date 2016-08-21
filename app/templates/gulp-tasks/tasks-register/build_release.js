(function () {
    'use strict';

    var runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('build-release', buildReleaseTask);
        gulp.task('build-release:watch', buildReleaseWatchTask);

        function buildReleaseTask(cb) {

            var args = [
                'release-clean',
                'bower-prepare',
                'bower-symlinks',
                'bower-install',
                'release-scripts:vendors',
                'release-scripts:sdk-no-templates',
                'release-scripts:sdk-only-templates',
                'release-scripts:client',
                'release-templates',
                'release-stylesheets:vendors',
                'release-stylesheets:client',
                'release-fonts',
                'release-images',
                'release-www',
                cb
            ];

            if (configuration.projectConfig.local_sdk === true) {
                args = ['build-sdk'].concat(args);
            }

            runSequence.apply(null, args);

        }

        function buildReleaseWatchTask(cb) {
            runSequence(
                'build-release',
                'release-scripts:watch',
                'release-templates:watch',
                'release-stylesheets:watch',
                'release-images:watch',
                'release-fonts:watch',
                cb
            );
        }
    };

}).call(this);
