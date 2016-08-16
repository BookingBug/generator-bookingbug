(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('tmp-stylesheets', stylesheetsTask);
        gulp.task('tmp-stylesheets:watch', stylesheetsWatchTask);

        var args = require('../helpers/args.js');
        var gulpFlatten = require('gulp-flatten');
        var gulpConcat = require('gulp-concat');
        var gulpCssSelectorLimit = require('gulp-css-selector-limit');
        var gulpPlumber = require('gulp-plumber');
        var gulpTemplate = require('gulp-template');
        var gulpSass = require('gulp-sass');
        var gulpSourcemaps = require('gulp-sourcemaps');
        var gulpUtil = require('gulp-util');
        var mainBowerFiles = require('main-bower-files');
        var projectConfig = require('../helpers/project_config.js');
        var streamqueue = require('streamqueue');

        function stylesheetsTask() {

            var src = path.join(plugins.config.projectRootPath, 'src/stylesheets/main.scss');

            var dependenciesCssFiles = mainBowerFiles({
                includeDev: true,
                paths: {
                    bowerDirectory: path.join(plugins.config.projectRootPath, 'bower_components'),
                    bowerrc: path.join(plugins.config.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(plugins.config.projectRootPath, 'bower.json')
                },
                filter: function (path) {
                    return path.match(new RegExp('.css$')) && !path.match(new RegExp('(bower_components\/bookingbug-angular-).+(\.css)')) && path.indexOf('boostrap.') === -1;
                }
            });

            var dependenciesCssStream = gulp.src(dependenciesCssFiles)
                .pipe(gulpSourcemaps.init());

            var gulpSassOptions = {
                onError: function (e) {
                    return console.log(e);
                }
            };

            if (args.getEnvironment() !== 'dev') {
                gulpSassOptions.outputStyle = 'compressed';
            }

            var appSCSSStream = gulp.src(src)
                .pipe(gulpSourcemaps.init())
                .pipe(gulpTemplate(projectConfig.getConfig()))
                .pipe(gulpSass(gulpSassOptions).on('error', gulpUtil.log));

            return streamqueue({
                objectMode: true
            }, dependenciesCssStream, appSCSSStream)
                .pipe(gulpPlumber())
                .pipe(gulpFlatten())
                .pipe(gulpConcat('styles.css'))
                .pipe(gulpCssSelectorLimit.reporter('fail'))
                .pipe(gulpSourcemaps.write('maps', {
                    includeContent: false
                }))
                .pipe(gulp.dest(plugins.config.projectTmpPath));
        }

        function stylesheetsWatchTask(cb) {

            var src = path.join(plugins.config.projectRootPath, 'src/stylesheets/main.scss');

            gulp.watch(src, ['tmp-stylesheets']);
            gulp.watch(['src/admin-booking/stylesheets/**/*'], ['build-sdk:admin-booking:stylesheets']);
            gulp.watch(['src/admin-dashboard/stylesheets/**/*'], ['build-sdk:admin-dashboard:stylesheets']);
            gulp.watch(['src/core/stylesheets/**/*'], ['build-sdk:core:stylesheets']);
            gulp.watch(['src/member/stylesheets/**/*'], ['build-sdk:member:stylesheets']);
            gulp.watch(['src/public-booking/stylesheets/**/*'], ['build-sdk:public-booking:stylesheets']);

            gulp.watch(
                [path.join(plugins.config.projectRootPath, 'bower_components/bookingbug-angular-*/**/*.scss')],
                ['tmp-stylesheets']
            );

            cb();
        }
    };

}).call(this);
