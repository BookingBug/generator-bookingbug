(function () {
    module.exports = function (gulp, plugins, path) {

        gulp.task('run-project', runProjectTask);
        gulp.task('run-project:watch', runProjectWatchtask);

        function runProjectTask(cb) {
            plugins.sequence('build-project', 'webserver', cb);
        }

        function runProjectWatchtask(cb) {
            plugins.sequence('build-project:watch', 'webserver', cb);
        }

    };

}).call(this);
