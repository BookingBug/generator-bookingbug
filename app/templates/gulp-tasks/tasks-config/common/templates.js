(function () {
    'use strict';

    var gulpAngularTemplateCache = require('gulp-angular-templatecache');
    var gulpConcat = require('gulp-concat');
    var gulpLiveReload = require('gulp-livereload');
    var gulpUglify = require('gulp-uglify');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('templates', templatesTask);

        function templatesTask() {

            var clientTemplates = path.join(configuration.projectRootPath, 'src/templates/**/*.html');

            var stream = gulp.src(clientTemplates)
                    .pipe(gulpAngularTemplateCache('booking-widget-templates.js', {
                        module: 'TemplateOverrides',
                        standalone: true
                    }))
                    .pipe(gulp.dest(configuration.projectReleasePath))
                ;

            if (configuration.projectConfig.uglify === true) {
                stream
                    .pipe(gulpUglify({
                        mangle: false
                    }))
                    .pipe(gulpConcat('client_templates.min.js'))
                    .pipe(gulp.dest(configuration.projectReleasePath))
                ;
            }

            return stream
                .pipe(gulpLiveReload())
                ;
        }
    };

}).call(this);
