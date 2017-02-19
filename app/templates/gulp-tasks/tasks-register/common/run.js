(function () {
    'use strict';

    const runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('run', runTask);
        gulp.task('run:watch', runWatchTask);

        function runTask(cb) {

            runSequence('release', 'webserver', 'webserver:open-browser', cb);
        }

        function runWatchTask(cb) {

            runSequence('release:watch', 'webserver', 'webserver:open-browser', cb);
        }

    };

})();
