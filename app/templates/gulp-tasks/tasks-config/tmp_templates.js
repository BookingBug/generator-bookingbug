(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-templates', templatesTask);
        gulp.task('tmp-templates:watch', templatesWatchTask);

        var args = require('../helpers/args.js');
        var gulpAngularTemplateCache = require('gulp-angular-templatecache');
        var gulpConcat = require('gulp-concat');
        var gulpFlatten = require('gulp-flatten');
        var gulpUglify = require('gulp-uglify');
        var gulpTemplate = require('gulp-template');
        var path = require('path');
        var runSequence = require('run-sequence');

        function templatesTask() {

            var clientTemplates = path.join(configuration.projectRootPath, 'src/templates/*.html');

            var stream = gulp.src(clientTemplates)
                .pipe(gulpAngularTemplateCache('client_templates.js', {module: 'TemplateOverrides', standalone: true}))
                .pipe(gulpFlatten())
                .pipe(gulpTemplate(configuration.projectConfig))
                .pipe(gulp.dest(configuration.projectTmpPath));

            if (configuration.projectConfig.uglify === true) {
                stream
                    .pipe(gulpUglify({
                        mangle: false
                    }))
                    .pipe(gulpConcat('client_templates.min.js'))
                    .pipe(gulp.dest(configuration.projectTmpPath));
            }

            return stream;
        }

        function templatesWatchTask(cb) {

            gulp.watch(configuration.projectRootPath + '/src/templates/*.html', function () {
                runSequence('tmp-templates', 'webserver:reload')
            });

            sdkTemplatesWatch();

            cb();
        }

        function sdkTemplatesWatch() {
            if (configuration.projectConfig.local_sdk !== true) {
                return;
            }

            gulp.watch([configuration.sdkRootPath + '/src/admin/templates/**/*'], ['build-sdk:admin:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/admin-booking/templates/**/*'], ['build-sdk:admin-booking:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/templates/**/*'], ['build-sdk:admin-dashboard/:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/core/templates/**/*'], ['build-sdk:core:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/events/templates/**/*'], ['build-sdk:events:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/member/templates/**/*'], ['build-sdk:member:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/templates/**/*'], ['build-sdk:public-booking:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/services/templates/**/*'], ['build-sdk:services:templates']);
            gulp.watch([configuration.sdkRootPath + '/src/settings/templates/**/*'], ['build-sdk:settings:templates']);

            gulp.watch(
                [configuration.projectRootPath + '/bower_components/bookingbug-angular-*/*templates.js'],
                function () {
                    runSequence('tmp-scripts:sdk-only-templates', 'webserver:reload');
                }
            );
        }
    };

}).call(this);
