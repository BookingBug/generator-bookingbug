(function () {
    'use strict';

    var gulpAngularTemplateCache = require('gulp-angular-templatecache');
    var gulpConcat = require('gulp-concat');
    var gulpFlatten = require('gulp-flatten');
    var gulpUglify = require('gulp-uglify');
    var gulpTemplate = require('gulp-template');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('templates', templatesTask);

        function templatesTask() {

            var clientTemplates = path.join(configuration.projectRootPath, 'src/templates/*.html');

            var stream = gulp.src(clientTemplates)
                .pipe(gulpAngularTemplateCache('client_templates.js', {module: 'TemplateOverrides', standalone: true}))
                .pipe(gulpFlatten())
                .pipe(gulpTemplate(configuration.projectConfig))
                .pipe(gulp.dest(configuration.projectReleasePath));

            if (configuration.projectConfig.uglify === true) {
                stream
                    .pipe(gulpUglify({
                        mangle: false
                    }))
                    .pipe(gulpConcat('client_templates.min.js'))
                    .pipe(gulp.dest(configuration.projectReleasePath));
            }

            return stream;
        }
    };

}).call(this);
