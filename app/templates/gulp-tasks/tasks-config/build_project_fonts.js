(function () {
    module.exports = function (gulp, plugins, path) {

        var args = require('../helpers/args.js');
        var gulpFlatten = require('gulp-flatten');
        var mainBowerFiles = require('main-bower-files');

        gulp.task('build-project-fonts', fontsTask);

        gulp.task('build-project-fonts:watch', fontsWatchTask);

        function fontsTask() {

            var src = path.join(plugins.config.projectRootPath, 'src/fonts/*.*');
            var dest = path.join(plugins.config.projectTmpPath, 'fonts');

            var dependenciesFontFiles = mainBowerFiles({
                includeDev: true,
                paths: {
                    bowerDirectory: path.join(plugins.config.projectRootPath, 'bower_components'),
                    bowerrc: path.join(plugins.config.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(plugins.config.projectRootPath, 'bower.json')
                },
                filter: '**/*.{eot,svg,ttf,woff,woff2,otf}'
            });

            return gulp.src(dependenciesFontFiles.concat(src))
                .pipe(gulpFlatten())
                .pipe(gulp.dest(dest));
        }

        function fontsWatchTask(cb) {
            var fontsSrcGlob = path.join(plugins.config.projectRootPath, 'src/fonts/*.*');

            gulp.watch(fontsSrcGlob, ['build-project-fonts']);
            gulp.watch(['src/public-booking/fonts/**/*'], ['build-sdk:public-booking:fonts']);

            cb();
        }
    };

}).call(this);
