(function () {
    module.exports = function (gulp, plugins, path) {

        var args = require('../helpers/args.js');
        var gulpTemplate = require('gulp-template');
        var projectConfig = require('../helpers/project_config.js');

        gulp.task('build-project-www', wwwTask);

        function wwwTask() {

            var src = path.join(plugins.config.projectRootPath, 'src/www/*.*');

            return gulp.src(src)
                .pipe(gulpTemplate(projectConfig.getConfig()))
                .pipe(gulp.dest(plugins.config.projectTmpPath));
        }
    };

}).call(this);
