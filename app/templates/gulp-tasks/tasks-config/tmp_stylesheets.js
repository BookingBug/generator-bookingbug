(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('tmp-stylesheets:vendors', stylesheetsVendorsTask);
        gulp.task('tmp-stylesheets:client', stylesheetsClientTask);
        gulp.task('tmp-stylesheets:watch', stylesheetsWatchTask);

        var args = require('../helpers/args.js');
        var gulpFlatten = require('gulp-flatten');
        var gulpConcat = require('gulp-concat');
        var gulpCssSelectorLimit = require('gulp-css-selector-limit');
        var gulpPlumber = require('gulp-plumber');
        var gulpPlumber = require('gulp-plumber');
        var gulpTemplate = require('gulp-template');
        var gulpSass = require('gulp-sass');
        var gulpSourcemaps = require('gulp-sourcemaps');
        var gulpUtil = require('gulp-util');
        var mainBowerFiles = require('main-bower-files');
        var projectConfig = require('../helpers/project_config.js');
        var streamqueue = require('streamqueue');

        function filterStylesheets(path) {
            return (
                path.match(new RegExp('.css$')) &&
                !path.match(new RegExp('(bower_components\/bookingbug-angular-).+(\.css)')) &&
                path.indexOf('boostrap.') == -1
            );
        }

        function stylesheetsVendorsTask() {
            var dependenciesCssFiles = mainBowerFiles({
                includeDev: true,
                paths: {
                    bowerDirectory: path.join(plugins.config.projectRootPath, 'bower_components'),
                    bowerrc: path.join(plugins.config.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(plugins.config.projectRootPath, 'bower.json')
                },
                filter: filterStylesheets
            });

            gulp.src(dependenciesCssFiles)
                .pipe(gulpConcat('vendors.css'))
                .pipe(gulp.dest(plugins.config.projectTmpPath));
        }

        function stylesheetsClientTask() {

            var src = path.join(plugins.config.projectRootPath, 'src/stylesheets/main.scss');

            var gulpSassOptions = {
                errLogToConsole: true,
                includePaths: ['bower_components/bootstrap-sass/assets/stylesheets']
            };

            if (args.getEnvironment() !== 'dev') {
                gulpSassOptions.outputStyle = 'compressed';
            }

            return gulp.src(src)
                .pipe(gulpSourcemaps.init())
                .pipe(gulpPlumber())
                .pipe(gulpSass(gulpSassOptions))
                .pipe(gulpConcat('client.css'))
                .pipe(gulpTemplate(projectConfig.getConfig()))
                .pipe(gulpCssSelectorLimit.reporter('fail'))
                .pipe(gulpSourcemaps.write('maps', { includeContent: false }))
                .pipe(gulp.dest(plugins.config.projectTmpPath));
        }

        function stylesheetsWatchTask(cb) {

            var src = path.join(plugins.config.projectRootPath, 'src/stylesheets/main.scss');

            gulp.watch(src, ['tmp-stylesheets:client', 'webserver:reload']);

            gulp.watch([path.join(plugins.config.sdkRootPath, 'src/admin-booking/stylesheets/**/*')], ['build-sdk:admin-booking:stylesheets']);
            gulp.watch([path.join(plugins.config.sdkRootPath, 'src/admin-dashboard/stylesheets/**/*')], ['build-sdk:admin-dashboard:stylesheets']);
            gulp.watch([path.join(plugins.config.sdkRootPath, 'src/core/stylesheets/**/*')], ['build-sdk:core:stylesheets']);
            gulp.watch([path.join(plugins.config.sdkRootPath, 'src/member/stylesheets/**/*')], ['build-sdk:member:stylesheets']);
            gulp.watch([path.join(plugins.config.sdkRootPath, 'src/public-booking/stylesheets/**/*')], ['build-sdk:public-booking:stylesheets']);

            gulp.watch(
                [path.join(plugins.config.projectRootPath, 'bower_components/bookingbug-angular-*/**/*.scss')],
                ['tmp-stylesheets:client', 'webserver:reload']
            );

            cb();
        }
    };

}).call(this);
