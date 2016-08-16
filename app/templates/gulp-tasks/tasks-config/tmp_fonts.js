(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('tmp-fonts', fontsTask);
        gulp.task('tmp-fonts:watch', fontsWatchTask);

        var args = require('../helpers/args.js');
        var gulpFlatten = require('gulp-flatten');
        var mainBowerFiles = require('main-bower-files');

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
            var fontsSrcGlob = plugins.config.projectRootPath + '/src/fonts/*.*';

            gulp.watch(fontsSrcGlob, ['tmp-fonts']);
            gulp.watch([plugins.config.sdkRootPath + '/src/public-booking/fonts/**/*' ], ['build-sdk:public-booking:fonts', 'webserver:reload']);

            cb();
        }
    };

}).call(this);
