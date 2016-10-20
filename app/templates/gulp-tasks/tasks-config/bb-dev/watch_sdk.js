(function () {
    'use strict';

    var path = require('path');

    var watchOptions = {
        read: false,
        readDelay: 500
    };

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
        }

        function fonts() {

            gulp.watch([configuration.sdkRootPath + '/src/public-booking/fonts/**/*'], ['build-sdk:public-booking:fonts'], watchOptions);
        }

        function images() {

            gulp.watch([configuration.sdkRootPath + '/src/admin/images/**/*'], ['build-sdk:admin:images'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/images/**/*'], ['build-sdk:admin-dashboard:images'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/images/**/*'], ['build-sdk:public-booking:images'], watchOptions);
        }

        function scripts() {

            gulp.watch([configuration.sdkRootPath + '/src/admin/javascripts/**/*'], ['build-sdk:admin:javascripts'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/admin-booking/javascripts/**/*'], ['build-sdk:admin-booking:javascripts'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/javascripts/**/*'], ['build-sdk:admin-dashboard:javascripts'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/core/javascripts/**/*'], ['build-sdk:core:javascripts'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/events/javascripts/**/*'], ['build-sdk:events:javascripts'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/member/javascripts/**/*'], ['build-sdk:member:javascripts'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/javascripts/**/*'], ['build-sdk:public-booking:javascripts'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/services/javascripts/**/*'], ['build-sdk:services:javascripts'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/settings/javascripts/**/*'], ['build-sdk:settings:javascripts'], watchOptions);

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

            gulp.watch([configuration.sdkRootPath + '/src/admin-booking/stylesheets/**/*'], ['build-sdk:admin-booking:stylesheets'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/stylesheets/**/*'], ['build-sdk:admin-dashboard:stylesheets'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/core/stylesheets/**/*'], ['build-sdk:core:stylesheets'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/member/stylesheets/**/*'], ['build-sdk:member:stylesheets'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/stylesheets/**/*'], ['build-sdk:public-booking:stylesheets'], watchOptions);

            gulp.watch(
                [configuration.projectRootPath + '/bower_components/bookingbug-angular-*/**/*.scss'],
                ['stylesheets:client'],
                watchOptions
            );
        }

        function templates() {

            gulp.watch([configuration.sdkRootPath + '/src/admin/templates/**/*'], ['build-sdk:admin:templates'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/admin-booking/templates/**/*'], ['build-sdk:admin-booking:templates'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/templates/**/*'], ['build-sdk:admin-dashboard:templates'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/core/templates/**/*'], ['build-sdk:core:templates'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/events/templates/**/*'], ['build-sdk:events:templates'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/member/templates/**/*'], ['build-sdk:member:templates'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/templates/**/*'], ['build-sdk:public-booking:templates'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/services/templates/**/*'], ['build-sdk:services:templates'], watchOptions);
            gulp.watch([configuration.sdkRootPath + '/src/settings/templates/**/*'], ['build-sdk:settings:templates'], watchOptions);

            gulp.watch(
                [configuration.projectRootPath + '/bower_components/bookingbug-angular-*/*templates.js'],
                ['scripts:client'],
                watchOptions
            );
        }
    };

}).call(this);
