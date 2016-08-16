(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('webserver', webserverTask);

        var gulpConnect = require('gulp-connect');

        function webserverTask() {
            return gulpConnect.server({
                root: [plugins.config.projectTmpPath],
                port: 8000,
                livereload: true
            });
        }
    };

}).call(this);
