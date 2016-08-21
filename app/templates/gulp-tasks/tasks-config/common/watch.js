(function () {
    'use strict';

    var runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('watch', watchTask);

        function watchTask() {
            fonts();
            images();
            scripts();
            stylesheets();
            templates();
        }

        function templates() {

            gulp.watch(configuration.projectRootPath + '/src/templates/*.html', function () {
                runSequence('templates', 'webserver:reload')
            });
        }

        function stylesheets() {

            gulp.watch(configuration.projectRootPath + '/src/stylesheets/main.scss', function () {
                runSequence('stylesheets:client', 'webserver:reload');
            });
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

            gulp.watch(projectFiles, function () {
                runSequence('scripts:client', 'webserver:reload');
            });
        }

        function images() {

            gulp.watch(configuration.projectRootPath + '/src/images/*.*', function () {
                runSequence('images', 'webserver:reload');
            });
        }

        function fonts() {

            gulp.watch(configuration.projectRootPath + '/src/fonts/*.*', function () {
                runSequence('fonts', 'webserver:reload');
            });
        }
    };

}).call(this);
