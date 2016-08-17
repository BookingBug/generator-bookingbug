(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('run', runTask);
        gulp.task('run:watch', runWatchtask);

        var runSequence = require('run-sequence');

        function runTask(cb) {
            runSequence('build-tmp', 'webserver', 'webserver:open-browser', cb);
        }

        function runWatchtask(cb) {
            runSequence('build-tmp:watch', 'webserver', 'webserver:open-browser', cb);
        }

    };

}).call(this);
