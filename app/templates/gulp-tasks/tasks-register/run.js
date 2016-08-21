(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('run', runTask);
        gulp.task('run:watch', runWatchtask);

        var runSequence = require('run-sequence');

        function runTask(cb) {
            runSequence('build-release', 'webserver', 'webserver:open-browser', cb);
        }

        function runWatchtask(cb) {
            runSequence('build-release:watch', 'webserver', 'webserver:open-browser', cb);
        }

    };

}).call(this);
