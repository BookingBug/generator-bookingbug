(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-fonts', fontsTask);
        gulp.task('tmp-fonts:watch', fontsWatchTask);

        var gulpFlatten = require('gulp-flatten');
        var mainBowerFiles = require('main-bower-files');
        var path = require('path');

        function fontsTask() {

            var src = path.join(configuration.projectRootPath, 'src/fonts/*.*');
            var dest = path.join(configuration.projectTmpPath, 'fonts');

            var dependenciesFontFiles = mainBowerFiles({
                includeDev: true,
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: '**/*.{eot,svg,ttf,woff,woff2,otf}'
            });

            return gulp.src(dependenciesFontFiles.concat(src))
                .pipe(gulpFlatten())
                .pipe(gulp.dest(dest));
        }

        function fontsWatchTask(cb) {
            var fontsSrcGlob = configuration.projectRootPath + '/src/fonts/*.*';

            gulp.watch(fontsSrcGlob, ['tmp-fonts']);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/fonts/**/*' ], ['build-sdk:public-booking:fonts', 'webserver:reload']);

            cb();
        }
    };

}).call(this);
