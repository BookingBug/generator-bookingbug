(function () {
    'use strict';

    var runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('release', releaseTask);
        gulp.task('release:watch', releaseWatchTask);

        function releaseTask(cb) {

            if (configuration.projectConfig.build.local_sdk === true) {
              runSequence.call(null,'build-sdk','clean','bower-install','copy','config',
              'scripts:vendors','templates','stylesheets:vendors','stylesheets:client',
              'fonts','images',
              'www','scripts:client',cb);
              return;
            }
              runSequence.call(null,'clean','bower-install','copy','config',
              'scripts:vendors','templates','stylesheets:vendors','stylesheets:client',
              'fonts','images',
              'www','scripts:client',cb);
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
