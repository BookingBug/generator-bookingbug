(function () {
    'use strict';

    const gulpFlatten = require('gulp-flatten');
    const gulpLiveReload = require('gulp-livereload');
    const mainBowerFiles = require('main-bower-files');
    const path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('fonts', fontsTask);

        function fontsTask() {

            let dependenciesFonts = mainBowerFiles({
                includeDev: true,
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: '**/*.{eot,svg,ttf,woff,woff2,otf}'
            });

            let clientFonts = path.join(configuration.projectRootPath, 'src/fonts/*.*');
            let dest = path.join(configuration.projectReleasePath, 'fonts');

            return gulp.src(dependenciesFonts.concat(clientFonts))
                .pipe(gulpFlatten())
                .pipe(gulp.dest(dest))
                .pipe(gulpLiveReload())
                ;
        }
    };

})();
