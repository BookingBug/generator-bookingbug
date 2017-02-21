(function () {
    'use strict';

    const gulpAngularTemplateCache = require('gulp-angular-templatecache');
    const gulpLiveReload = require('gulp-livereload');
    const gulpTemplate = require('gulp-template');
    const gulpUglify = require('gulp-uglify');
    const path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('templates', templatesTask);

        function templatesTask() {

            let clientTemplates = path.join(configuration.projectRootPath, 'src/templates/**/*.html');

            let stream = gulp.src(clientTemplates)
                    .pipe(gulpAngularTemplateCache('booking-widget-templates.js', {
                        module: 'TemplateOverrides',
                        standalone: true
                    }))
                    .pipe(gulpTemplate(configuration.projectConfig))
                ;

            if (configuration.projectConfig.build.uglify === true) {
                stream
                    .pipe(gulpUglify({
                        mangle: false
                    }))
                ;
            }

            stream.pipe(gulp.dest(configuration.projectReleasePath));

            return stream
                .pipe(gulpLiveReload())
                ;
        }
    };

})();
