(function () {
    'use strict';

    const argv = require('yargs').argv;
    const gulpConcat = require('gulp-concat');
    const gulpCssSelectorLimit = require('gulp-css-selector-limit');
    const gulpPlumber = require('gulp-plumber');
    const gulpSass = require('gulp-sass');
    const gulpSourcemaps = require('gulp-sourcemaps');
    const mainBowerFiles = require('main-bower-files');
    const path = require('path');
    const gulpIf = require('gulp-if');
    const gulpBless = require('gulp-bless');
    const gulpUtil = require('gulp-util');

    module.exports = function (gulp, configuration) {

        gulp.task('stylesheets:vendors', stylesheetsVendorsTask);
        gulp.task('stylesheets:client', stylesheetsClientTask);

        function filterStylesheets(path) {
            return (
                path.match(/\.css$/) && (path.indexOf('bootstrap.') === -1) && (path.indexOf('bookingbug-angular-') === -1)
            );
        }

        function blessErrorHandler (err) {
            var msg = "gulp-bless plugin has failed to validate booking-widget.css. Use --ignoreBless flag or update your project to use SDK v1.4.26+ or v2.2.17+";
            gulpUtil.log(gulpUtil.colors.bgRed(msg));
            process.exit(1);
        }

        function stylesheetsVendorsTask() {
            let dependenciesCssFiles = mainBowerFiles({
                includeDev: true,
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: filterStylesheets
            });

            gulp.src(dependenciesCssFiles)
                .pipe(gulpConcat('booking-widget-dependencies.css'))
                .pipe(gulpIf(!argv.ignoreBless, gulpBless({log: false}))).on('error', blessErrorHandler)
                .pipe(gulp.dest(configuration.projectReleasePath));
        }

        function stylesheetsClientTask() {

            let clientSCSS = path.join(configuration.projectRootPath, 'src/stylesheets/main.scss');

            let gulpSassOptions = {
                errLogToConsole: true,
                includePaths: [path.join(configuration.projectRootPath, 'bower_components/bootstrap-sass/assets/stylesheets')]
            };

            if (configuration.projectConfig.build.uglify === true) {
                gulpSassOptions.outputStyle = 'compressed';
            }

            return gulp.src(clientSCSS)
                .pipe(gulpSourcemaps.init())
                .pipe(gulpPlumber())
                .pipe(gulpSass(gulpSassOptions).on('error', gulpSass.logError))
                .pipe(gulpConcat('booking-widget.css'))
                .pipe(gulpIf(!argv.ignoreBless, gulpBless({log: false}))).on('error', blessErrorHandler)
                .pipe(gulpCssSelectorLimit.reporter('fail'))
                .pipe(gulpSourcemaps.write('maps', {includeContent: false}))
                .pipe(gulp.dest(configuration.projectReleasePath));
        }
    };

})();
