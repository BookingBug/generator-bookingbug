(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('build-tmp', buildTmpTask);
        gulp.task('build-tmp:watch', buildTmpWatchTask);

        var runSequence = require('run-sequence');

        function buildTmpTask(cb) {
            runSequence(
                'build-sdk',
                'tmp-clean',
                'tmp-bower-prepare',
                'tmp-bower-symlinks',
                'tmp-bower-install',
                'tmp-scripts:vendors',
                'tmp-scripts:sdk-no-templates',
                'tmp-scripts:sdk-only-templates',
                'tmp-scripts:client',
                'tmp-templates',
                'tmp-stylesheets:vendors',
                'tmp-stylesheets:client',
                'tmp-fonts',
                'tmp-images',
                'tmp-www',
                cb
            );
        }

        function buildTmpWatchTask(cb) {
            runSequence(
                'build-tmp',
                'tmp-scripts:watch',
                'tmp-templates:watch',
                'tmp-stylesheets:watch',
                'tmp-images:watch',
                'tmp-fonts:watch',
                cb
            );
        }
    };

}).call(this);
