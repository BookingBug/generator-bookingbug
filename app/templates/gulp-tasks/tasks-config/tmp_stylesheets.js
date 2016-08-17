(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-stylesheets:vendors', stylesheetsVendorsTask);
        gulp.task('tmp-stylesheets:client', stylesheetsClientTask);
        gulp.task('tmp-stylesheets:watch', stylesheetsWatchTask);

        var args = require('../helpers/args.js');
        var gulpCssSelectorLimit = require('gulp-css-selector-limit');
        var gulpConcat = require('gulp-concat');
        var gulpPlumber = require('gulp-plumber');
        var gulpSass = require('gulp-sass');
        var gulpSourcemaps = require('gulp-sourcemaps');
        var gulpTemplate = require('gulp-template');
        var mainBowerFiles = require('main-bower-files');
        var path = require('path');
        var runSequence = require('run-sequence');

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

            var src = path.join(configuration.projectRootPath, 'src/stylesheets/main.scss');

            var gulpSassOptions = {
                errLogToConsole: true,
                includePaths: [path.join(configuration.projectRootPath,'bower_components/bootstrap-sass/assets/stylesheets')]
            };

            if (args.getEnvironment() !== 'dev') {
                gulpSassOptions.outputStyle = 'compressed';
            }

            return gulp.src(src)
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
                runSequence('tmp-stylesheets:client', 'webserver:reload');
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
                    runSequence('tmp-stylesheets:client', 'webserver:reload');
                }
            );
        }
    };

}).call(this);
