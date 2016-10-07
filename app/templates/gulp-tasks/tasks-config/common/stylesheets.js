(function () {
    'use strict';

    var autoprefixer = require('autoprefixer');
    var gulpConcat = require('gulp-concat');
    var gulpCssSelectorLimit = require('gulp-css-selector-limit');
    var gulpPlumber = require('gulp-plumber');
    var gulpPostCss = require('gulp-postcss');
    var gulpSass = require('gulp-sass');
    var gulpSourceMaps = require('gulp-sourcemaps');
    var gulpTemplate = require('gulp-template');
    var mainBowerFiles = require('main-bower-files');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('stylesheets:vendors', stylesheetsVendorsTask);
        gulp.task('stylesheets:client', stylesheetsClientTask);

        function filterStylesheets(path) {
            return (
                path.match(/\.css$/) && (path.indexOf('bootstrap.') === -1) && (path.indexOf('bookingbug-angular-') === -1)
            );
        }

        function stylesheetsVendorsTask() {
            var dependenciesCssFiles = mainBowerFiles({
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
                .pipe(gulp.dest(configuration.projectReleasePath))
            ;
        }

        function stylesheetsClientTask() {

            var clientSCSS = path.join(configuration.projectRootPath, 'src/stylesheets/main.scss');

            var gulpSassOptions = {
                errLogToConsole: true,
                includePaths: [path.join(configuration.projectRootPath, 'bower_components/bootstrap-sass/assets/stylesheets')]
            };

            if (configuration.projectConfig.uglify === true) {
                gulpSassOptions.outputStyle = 'compressed';
            }

            //https://github.com/postcss/autoprefixer
            //https://github.com/postcss/gulp-postcss
            //https://github.com/ai/browserslist#queries
            //https://github.com/floridoo/gulp-sourcemaps
            //http://caniuse.com/#comparison

            var postCssProcessors = [
                autoprefixer({
                    browsers: [
                        'last 3 versions',
                        'last 10 Chrome versions',
                        'last 10 Opera versions',
                        'last 10 Firefox versions',
                        'not Explorer <= 8'
                    ]
                })
            ];

            return gulp.src(clientSCSS)
                .pipe(gulpSourceMaps.init())
                .pipe(gulpPlumber())
                .pipe(gulpSass(gulpSassOptions).on('error', gulpSass.logError))
                .pipe(gulpPostCss(postCssProcessors))
                .pipe(gulpConcat('booking-widget.css'))
                .pipe(gulpTemplate(configuration.projectConfig))
                .pipe(gulpCssSelectorLimit.reporter('fail'))
                .pipe(gulpSourceMaps.write('maps', {includeContent: false}))
                .pipe(gulp.dest(configuration.projectReleasePath))
                ;
        }
    };

}).call(this);
