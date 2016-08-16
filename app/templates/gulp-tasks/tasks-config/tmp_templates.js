(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('tmp-templates', templatesTask);
        gulp.task('tmp-templates:watch', templatesWatchTask);

        var args = require('../helpers/args.js');
        var gulpAngularTemplateCache = require('gulp-angular-templatecache');
        var gulpConcat = require('gulp-concat');
        var gulpFlatten = require('gulp-flatten');
        var gulpUglify = require('gulp-uglify');
        var gulpTemplate = require('gulp-template');
        var projectConfig = require('../helpers/project_config.js');

        function templatesTask() {

            var templatesSrcGlob = path.join(plugins.config.projectRootPath, 'src/templates/*.html');

            var stream = gulp.src(templatesSrcGlob)
                .pipe(gulpAngularTemplateCache('client_templates.js', {module: 'TemplateOverrides', standalone: true}))
                .pipe(gulpFlatten())
                .pipe(gulpTemplate(projectConfig.getConfig()))
                .pipe(gulp.dest(plugins.config.projectTmpPath));

            if (args.getEnvironment() !== 'dev') {
                stream
                    .pipe(gulpUglify({
                        mangle: false
                    }))
                    .pipe(gulpConcat('client_templates.min.js'))
                    .pipe(gulp.dest(plugins.config.projectTmpPath));
            }

            return stream;
        }

        function templatesWatchTask(cb) {

            var templatesSrcGlob = plugins.config.projectRootPath + '/src/templates/*.html';

            gulp.watch(templatesSrcGlob, ['tmp-templates', 'webserver:reload']);

            gulp.watch([plugins.config.sdkRootPath + '/src/admin/templates/**/*'], ['build-sdk:admin:templates']);
            gulp.watch([plugins.config.sdkRootPath + '/src/admin-booking/templates/**/*'], ['build-sdk:admin-booking:templates']);
            gulp.watch([plugins.config.sdkRootPath + '/src/admin-dashboard/templates/**/*'], ['build-sdk:admin-dashboard/:templates']);
            gulp.watch([plugins.config.sdkRootPath + '/src/core/templates/**/*'], ['build-sdk:core:templates']);
            gulp.watch([plugins.config.sdkRootPath + '/src/events/templates/**/*'], ['build-sdk:events:templates']);
            gulp.watch([plugins.config.sdkRootPath + '/src/member/templates/**/*'], ['build-sdk:member:templates']);
            gulp.watch([plugins.config.sdkRootPath + '/src/public-booking/templates/**/*'], ['build-sdk:public-booking:templates']);
            gulp.watch([plugins.config.sdkRootPath + '/src/services/templates/**/*'], ['build-sdk:services:templates']);
            gulp.watch([plugins.config.sdkRootPath + '/src/settings/templates/**/*'], ['build-sdk:settings:templates']);

            gulp.watch(
                [plugins.config.projectRootPath + '/bower_components/bookingbug-angular-*/*templates.js'],
                ['tmp-scripts:sdk-only-templates', 'webserver:reload']
            );
            cb();
        }
    };

}).call(this);
