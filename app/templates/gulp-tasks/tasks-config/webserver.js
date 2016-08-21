(function () {
    'use strict';

    var gulpConnect = require('gulp-connect');
    var gulpOpen = require('gulp-open');

    module.exports = function (gulp, configuration) {

        gulp.task('webserver', webServerTask);
        gulp.task('webserver:open-browser', openBrowserTask);
        gulp.task('webserver:reload', reloadTask);

        function webServerTask() {
            return gulpConnect.server({
                root: [configuration.projectTmpPath],
                port: 8000,
                livereload: true
            });
        }

        function openBrowserTask() {

            var gulpOpenOptions = {
                uri: 'http://localhost:' + configuration.projectConfig.server_port + configuration.projectConfig.default_html
            };

            return gulp.src('')
                .pipe(gulpOpen(gulpOpenOptions));
        }

        function reloadTask() {
            return gulp.src(configuration.projectTmpPath + '/**/*')
                .pipe(gulpConnect.reload());
        }

    };

}).call(this);
