(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('run', runTask);
        gulp.task('run:watch', runWatchtask);

        function runTask(cb) {
            plugins.sequence('build-tmp', 'webserver', 'webserver:open-browser', cb);
        }

        function runWatchtask(cb) {
            plugins.sequence('build-tmp:watch', 'webserver', 'webserver:open-browser', cb);
        }

    };

}).call(this);
