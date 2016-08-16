(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('tmp-www', wwwTask);

        var args = require('../helpers/args.js');
        var gulpTemplate = require('gulp-template');
        var projectConfig = require('../helpers/project_config.js');

        function wwwTask() {

            var src = path.join(plugins.config.projectRootPath, 'src/www/*.*');

            return gulp.src(src)
                .pipe(gulpTemplate(projectConfig.getConfig()))
                .pipe(gulp.dest(plugins.config.projectTmpPath));
        }
    };

}).call(this);
