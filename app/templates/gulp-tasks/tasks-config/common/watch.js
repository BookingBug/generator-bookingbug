(function () {
    'use strict';

    var gulpLiveReload = require('gulp-livereload');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('watch', watchTask);


        /**
         * @throws Error
         *      If the error code thrown is: 'ENOSPC', increase fs.inotify.max_user_watches appropriately.
         *      On Linux machines you can do it with following command:
         *      <pre>
         *          echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
         *      </pre>
         */
        function watchTask() {

            gulpLiveReload.listen();

            fonts();
            images();
            scripts();
            stylesheets();
            templates();
            www();
        }

        function www() {
            gulp.watch(configuration.projectRootPath + '/src/www/*.html', ['www']);
        }

        function templates() {

            gulp.watch(configuration.projectRootPath + '/src/templates/*.html', ['templates']);
        }

        function stylesheets() {

            gulp.watch(path.join(configuration.projectRootPath, '/src/stylesheets/**/*.scss'), ['stylesheets:client']);

            gulp
                .watch(path.join(configuration.projectReleasePath, 'booking-widget.css'))
                .on('change', gulpLiveReload.changed);
        }


        function scripts() {

            var projectFiles = [
                configuration.projectRootPath + '/src/javascripts/**/*.js',
                configuration.projectRootPath + '/src/javascripts/**/*.js.coffee',
                '!**/*.spec.js',
                '!**/*.spec.js.coffee',
                '!**/*.js.js',
                '!**/*.js.map'
            ];

            gulp.watch(projectFiles, ['scripts:client']);
        }

        function images() {

            gulp.watch(configuration.projectRootPath + '/src/images/*.*', ['images']);
        }

        function fonts() {

            gulp.watch(configuration.projectRootPath + '/src/fonts/*.*', ['fonts']);
        }
    };

}).call(this);
