(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-fonts', fontsTask);
        gulp.task('tmp-fonts:watch', fontsWatchTask);

        var gulpFlatten = require('gulp-flatten');
        var mainBowerFiles = require('main-bower-files');
        var path = require('path');
        var runSequence = require('run-sequence');

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

            gulp.watch(configuration.projectRootPath + '/src/fonts/*.*', function(){
                runSequence('tmp-fonts', 'webserver:reload');
            });

            gulp.watch([configuration.sdkRootPath + '/src/public-booking/fonts/**/*'], function () {
                runSequence('build-sdk:public-booking:fonts', 'webserver:reload');
            });

            cb();
        }
    };

}).call(this);
