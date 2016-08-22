(function () {
    'use strict';

    var gulpConnect = require('gulp-connect');
    var gulpFlatten = require('gulp-flatten');
    var mainBowerFiles = require('main-bower-files');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('fonts', fontsTask);

        function fontsTask() {

            var dependenciesFonts = mainBowerFiles({
                includeDev: true,
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: '**/*.{eot,svg,ttf,woff,woff2,otf}'
            });

            var clientFonts = path.join(configuration.projectRootPath, 'src/fonts/*.*');
            var dest = path.join(configuration.projectReleasePath, 'fonts');

            return gulp.src(dependenciesFonts.concat(clientFonts))
                .pipe(gulpFlatten())
                .pipe(gulp.dest(dest))
                .pipe(gulpConnect.reload())
                ;
        }
    };

}).call(this);
