(function () {
    'use strict';

    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('watch-sdk', watchSdkTask);

        function watchSdkTask() {

            if (configuration.projectConfig.local_sdk !== true) {
                return;
            }

            fonts();
            images();
            scripts();
            stylesheets();
            templates();
        }

        function fonts() {

            gulp.watch([configuration.sdkRootPath + '/src/public-booking/fonts/**/*'], ['build-sdk:public-booking:fonts']);
        }

        function images() {

            gulp.watch([configuration.sdkRootPath + '/src/admin/images/**/*'], ['build-sdk:admin:images']);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/images/**/*'], ['build-sdk:admin-dashboard:images']);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/images/**/*'], ['build-sdk:public-booking:images']);
        }

        function scripts() {

            gulp.watch([configuration.sdkRootPath + '/src/admin/javascripts/**/*'], ['build-sdk:admin:javascripts']);
            gulp.watch([configuration.sdkRootPath + '/src/admin-booking/javascripts/**/*'], ['build-sdk:admin-booking:javascripts']);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/javascripts/**/*'], ['build-sdk:admin-dashboard:javascripts']);
            gulp.watch([configuration.sdkRootPath + '/src/core/javascripts/**/*'], ['build-sdk:core:javascripts']);
            gulp.watch([configuration.sdkRootPath + '/src/events/javascripts/**/*'], ['build-sdk:events:javascripts']);
            gulp.watch([configuration.sdkRootPath + '/src/member/javascripts/**/*'], ['build-sdk:member:javascripts']);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/javascripts/**/*'], ['build-sdk:public-booking:javascripts']);
            gulp.watch([configuration.sdkRootPath + '/src/services/javascripts/**/*'], ['build-sdk:services:javascripts']);
            gulp.watch([configuration.sdkRootPath + '/src/settings/javascripts/**/*'], ['build-sdk:settings:javascripts']);

            gulp.watch(
                [
                    configuration.projectRootPath + '/bower_components/bookingbug-angular-*/*.js',
                    '!' + configuration.projectRootPath + '/bower_components/bookingbug-angular-*/*-templates.js'
                ],
                ['scripts:client']
            );
        }

        function stylesheets() {

            gulp.watch([configuration.sdkRootPath + '/src/admin-booking/stylesheets/**/*'], ['build-sdk:admin-booking:stylesheets']);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/stylesheets/**/*'], ['build-sdk:admin-dashboard:stylesheets']);
            gulp.watch([configuration.sdkRootPath + '/src/core/stylesheets/**/*'], ['build-sdk:core:stylesheets']);
            gulp.watch([configuration.sdkRootPath + '/src/member/stylesheets/**/*'], ['build-sdk:member:stylesheets']);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/stylesheets/**/*'], ['build-sdk:public-booking:stylesheets']);

            gulp.watch(
                [configuration.projectRootPath + '/bower_components/bookingbug-angular-*/**/*.scss'],
                ['stylesheets:client']
            );
        }

        function templates() {

            gulp.watch([configuration.sdkRootPath + '/src/admin/templates/**/*'], ['build-sdk:admin:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/admin-booking/templates/**/*'], ['build-sdk:admin-booking:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/templates/**/*'], ['build-sdk:admin-dashboard:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/core/templates/**/*'], ['build-sdk:core:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/events/templates/**/*'], ['build-sdk:events:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/member/templates/**/*'], ['build-sdk:member:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/templates/**/*'], ['build-sdk:public-booking:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/services/templates/**/*'], ['build-sdk:services:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/settings/templates/**/*'], ['build-sdk:settings:templates']);

            gulp.watch(
                [configuration.projectRootPath + '/bower_components/bookingbug-angular-*/*templates.js'],
                ['scripts:client']
            );
        }
    };

}).call(this);