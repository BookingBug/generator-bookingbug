(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('webserver', webserverTask);
        gulp.task('webserver:open-browser', openBrowserTask);
        gulp.task('webserver:reload', reloadTask);

        var gulpOpen = require('gulp-open');
        var gulpConnect = require('gulp-connect');

        function webserverTask() {
            return gulpConnect.server({
                root: [plugins.config.projectTmpPath],
                port: 8000,
                livereload: true
            });
        }

        function openBrowserTask() {

            var gulpOpenOptions = {
                uri: 'http://localhost:' + plugins.config.projectConfig.server_port + plugins.config.projectConfig.default_html
            };

            return gulp.src('')
                .pipe(gulpOpen(gulpOpenOptions));
        }

        function reloadTask() {
            return gulp.src(plugins.config.projectTmpPath + '/**/*')
                .pipe(gulpConnect.reload());
        }

    };

}).call(this);
