(function () {
    'use strict';

    var args = require('../helpers/args.js');
    var gulpConcat = require('gulp-concat');
    var gulpCssSelectorLimit = require('gulp-css-selector-limit');
    var gulpPlumber = require('gulp-plumber');
    var gulpSass = require('gulp-sass');
    var gulpSourcemaps = require('gulp-sourcemaps');
    var gulpTemplate = require('gulp-template');
    var mainBowerFiles = require('main-bower-files');
    var path = require('path');
    var runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('release-stylesheets:vendors', stylesheetsVendorsTask);
        gulp.task('release-stylesheets:client', stylesheetsClientTask);
        gulp.task('release-stylesheets:watch', stylesheetsWatchTask);

        function filterStylesheets(path) {
            return (
                path.match(/\.css$/) && path.indexOf('bootstrap.') == -1
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
                .pipe(gulpConcat('vendors.css'))
                .pipe(gulp.dest(configuration.projectTmpPath));
        }

        function stylesheetsClientTask() {

            var clientSCSS = path.join(configuration.projectRootPath, 'src/stylesheets/main.scss');

            var gulpSassOptions = {
                errLogToConsole: true,
                includePaths: [path.join(configuration.projectRootPath,'bower_components/bootstrap-sass/assets/stylesheets')]
            };

            if (configuration.projectConfig.uglify === true) {
                gulpSassOptions.outputStyle = 'compressed';
            }

            return gulp.src(clientSCSS)
                .pipe(gulpSourcemaps.init())
                .pipe(gulpPlumber())
                .pipe(gulpSass(gulpSassOptions))
                .pipe(gulpConcat('client.css'))
                .pipe(gulpTemplate(configuration.projectConfig))
                .pipe(gulpCssSelectorLimit.reporter('fail'))
                .pipe(gulpSourcemaps.write('maps', {includeContent: false}))
                .pipe(gulp.dest(configuration.projectTmpPath));
        }

        function stylesheetsWatchTask(cb) {

            gulp.watch(configuration.projectRootPath + '/src/stylesheets/main.scss', function () {
                runSequence('release-stylesheets:client', 'webserver:reload');
            });

            sdkStylesheetsWatch();

            cb();
        }

        function sdkStylesheetsWatch() {
            if (configuration.projectConfig.local_sdk !== true) {
                return;
            }

            gulp.watch([configuration.sdkRootPath + '/src/admin-booking/stylesheets/**/*'], ['build-sdk:admin-booking:stylesheets']);
            gulp.watch([configuration.sdkRootPath + '/src/admin-dashboard/stylesheets/**/*'], ['build-sdk:admin-dashboard:stylesheets']);
            gulp.watch([configuration.sdkRootPath + '/src/core/stylesheets/**/*'], ['build-sdk:core:stylesheets']);
            gulp.watch([configuration.sdkRootPath + '/src/member/stylesheets/**/*'], ['build-sdk:member:stylesheets']);
            gulp.watch([configuration.sdkRootPath + '/src/public-booking/stylesheets/**/*'], ['build-sdk:public-booking:stylesheets']);

            gulp.watch(
                [configuration.projectRootPath + '/bower_components/bookingbug-angular-*/**/*.scss'],
                function () {
                    runSequence('release-stylesheets:client', 'webserver:reload');
                }
            );
        }
    };

}).call(this);
