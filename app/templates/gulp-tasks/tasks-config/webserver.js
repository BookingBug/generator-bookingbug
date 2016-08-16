(function () {
    module.exports = function (gulp, plugins, path) {

        var gulpConnect = require('gulp-connect');

        gulp.task('webserver', webserverTask);

        function webserverTask() {
            return gulpConnect.server({
                root: [plugins.config.projectTmpPath],
                port: 8000,
                livereload: true
            });
        }
    };

}).call(this);
