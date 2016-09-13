(function () {
    'use strict';

    var gulpLiveReload = require('gulp-livereload');
    var path = require('path');

    var watchOptions = {
        read: false,
        readDelay: 500
    };

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

            release();
        }

        function www() {
            gulp.watch(configuration.projectRootPath + '/src/www/*.html', ['www'], watchOptions);
        }

        function templates() {

            gulp.watch(configuration.projectRootPath + '/src/templates/**/*.html', ['templates'], watchOptions);
        }

        function stylesheets() {

            gulp.watch(path.join(configuration.projectRootPath, '/src/stylesheets/**/*.scss'), ['stylesheets:client'], watchOptions);

            gulp
                .watch(path.join(configuration.projectReleasePath, 'booking-widget.css'), watchOptions)
                .on('change', gulpLiveReload.changed);
        }


        function scripts() {

            var projectFiles = [
                configuration.projectRootPath + '/src/javascripts/**/*.js',
                configuration.projectRootPath + '/src/javascripts/**/*.js.coffee',
                '!' + configuration.projectRootPath + '/src/javascripts/**/*.spec.js',
                '!' + configuration.projectRootPath + '/src/javascripts/**/*.spec.js.coffee',
                '!' + configuration.projectRootPath + '/src/javascripts/**/*.js.js',
                '!' + configuration.projectRootPath + '/src/javascripts/**/*.js.map'
            ];

            gulp.watch(projectFiles, ['scripts:client'], watchOptions);
        }

        function images() {

            gulp.watch(configuration.projectRootPath + '/src/images/*.*', ['images'], watchOptions);
        }

        function fonts() {

            gulp.watch(configuration.projectRootPath + '/src/fonts/*.*', ['fonts'], watchOptions);
        }

        function release() {
            gulp.watch(configuration.projectReleasePath + '/**/*.js', watchOptions)
                .on('change', gulpLiveReload.changed)
        }
    };

}).call(this);
