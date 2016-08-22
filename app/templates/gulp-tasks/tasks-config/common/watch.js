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

            gulp.watch(configuration.projectRootPath + '/src/templates/*.html', ['templates']);
        }

        function stylesheets() {

            gulp.watch(configuration.projectRootPath + '/src/stylesheets/main.scss', ['stylesheets:client']);
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
