(function () {
    'use strict';

    var path = require('path');
    var runSequence = require('run-sequence');

    var watchOptions = {
        read: false,
        readDelay: 500
    };

    var dmz = Object.create(null);

    module.exports = function (gulp, configuration) {

        gulp.task('watch-sdk', watchSdkTask);

        function watchSdkTask() {

            if (configuration.projectConfig.build.local_sdk !== true) {
                return;
            }

            fonts();
            images();
            scripts();
            stylesheets();
            templates();
            configs();
        }

        function fonts() {
            configuration.bbDependencies.forEach(function (dirName) {
                gulp.watch([configuration.sdkRootPath + '/src/' + dirName + '/fonts/**/*'], ['build-sdk:' + dirName + ':fonts'], watchOptions);
            });
        }

        function images() {
            configuration.bbDependencies.forEach(function (dirName) {
                gulp.watch([configuration.sdkRootPath + '/src/' + dirName + '/images/**/*'], ['build-sdk:' + dirName + ':images'], watchOptions);
            });
        }

        function scripts() {
            configuration.bbDependencies.forEach(function (dirName) {
                gulp.watch([configuration.sdkRootPath + '/src/' + dirName + '/javascripts/**/*'], ['build-sdk:' + dirName + ':javascripts'], watchOptions);
            });

            gulp.watch(
                [
                    configuration.projectRootPath + '/bower_components/bookingbug-angular-*/*.js',
                    '!' + configuration.projectRootPath + '/bower_components/bookingbug-angular-*/*-templates.js'
                ],
                ['scripts:client'],
                watchOptions
            );
        }

        function stylesheets() {
            configuration.bbDependencies.forEach(function (dirName) {
                gulp.watch([configuration.sdkRootPath + '/src/' + dirName + '/stylesheets/**/*'], ['build-sdk:' + dirName + ':stylesheets'], watchOptions);
            });

            gulp.watch(
                [configuration.projectRootPath + '/bower_components/bookingbug-angular-*/**/*.scss'],
                ['stylesheets:client'],
                watchOptions
            );
        }

        function templates() {
            configuration.bbDependencies.forEach(function (dirName) {
                gulp.watch([configuration.sdkRootPath + '/src/' + dirName + '/templates/**/*'], ['build-sdk:' + dirName + ':templates'], watchOptions);
            });

            gulp.watch(
                [configuration.projectRootPath + '/bower_components/bookingbug-angular-*/*templates.js'],
                ['scripts:client'],
                watchOptions
            );
        }

        function configs() {
            configuration.bbDependencies.forEach(function (dirName) {
                gulp.watch([configuration.sdkRootPath + '/src/' + dirName + '/config/**/*'], configSequence.bind(dmz, 'build-sdk:' + dirName + ':config'), watchOptions);
            });
        }

        /**
         * @param {String} taskName
         */
        function configSequence(taskName) {
            runSequence(taskName, 'config', 'scripts:client', 'templates');
        }
    };

}).call(this);
