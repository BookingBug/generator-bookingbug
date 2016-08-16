(function () {
    module.exports = function (gulp, plugins, path) {

        gulp.task('build-project-scripts:vendors', scriptsVendorsTask);
        gulp.task('build-project-scripts:sdk-no-templates', scriptsSdkNoTemplates);
        gulp.task('build-project-scripts:sdk-only-templates', scriptsSdkOnlyTemplates);
        gulp.task('build-project-scripts:client', scriptsClient);
        gulp.task('build-project-scripts:watch', scriptsWatch);

        var args = require('../helpers/args.js');
        var gulpCoffee = require('gulp-coffee');
        var gulpConcat = require('gulp-concat');
        var gulpIf = require('gulp-if');
        var gulpUglify = require('gulp-uglify');
        var gulpUtil = require('gulp-util');
        var mainBowerFiles = require('main-bower-files');

        var projectFiles = [
            path.join(plugins.config.projectRootPath, 'src/javascripts/**/*.js'),
            path.join(plugins.config.projectRootPath, 'src/javascripts/**/*.js.coffee'),
            path.join('!**/*.spec.js'),
            path.join('!**/*.spec.js.coffee'),
            path.join('!**/*.js.js'),
            path.join('!**/*.js.map')
        ];

        function scriptsVendorsTask() {
            return buildVendorScripts(nonBbDependenciesFilter, 'vendors');
        }

        function scriptsSdkNoTemplates() {
            return buildVendorScripts(bbDependenciesNoTemplatesFilter, 'sdk');
        }

        function scriptsSdkOnlyTemplates() {
            return buildVendorScripts(bbDependenciesOnlyTemplatesFilter, 'sdk_templates');
        }

        function scriptsClient() {
            return buildProjectScripts('client');
        }

        function scriptsWatch(cb) {

            gulp.watch(projectFiles, ['build-project-scripts:client']);

            gulp.watch(['src/admin/javascripts/**/*'], ['build-sdk:admin:javascripts']);
            gulp.watch(['src/admin-booking/javascripts/**/*'], ['build-sdk:admin-booking:javascripts']);
            gulp.watch(['src/admin-dashboard/javascripts/**/*'], ['build-sdk:admin-dashboard:javascripts']);
            gulp.watch(['src/core/javascripts/**/*'], ['build-sdk:core:javascripts']);
            gulp.watch(['src/events/javascripts/**/*'], ['build-sdk:events:javascripts']);
            gulp.watch(['src/member/javascripts/**/*'], ['build-sdk:member:javascripts']);
            gulp.watch(['src/public-booking/javascripts/**/*'], ['build-sdk:public-booking:javascripts']);
            gulp.watch(['src/services/javascripts/**/*'], ['build-sdk:services:javascripts']);
            gulp.watch(['src/settings/javascripts/**/*'], ['build-sdk:settings:javascripts']);
            gulp.watch(
                [
                    path.join(plugins.config.projectRootPath, 'bower_components/bookingbug-angular-*/*.js'),
                    '!' + path.join(plugins.config.projectRootPath, 'bower_components/bookingbug-angular-*/*-templates.js')
                ],
                ['build-project-scripts:sdk-no-templates']
            );
            cb();
        }

        /*
         * @param {Array.<String>} files
         * @param {String} filename
         */
        function buildScriptsStream(files, filename) {
            var stream;
            stream = gulp.src(files).pipe(gulpIf(/.*js.coffee$/, gulpCoffee().on('error', gulpUtil.log))).pipe(gulpConcat(filename + '.js')).pipe(gulp.dest(plugins.config.projectTmpPath));
            if (args.getEnvironment() !== 'dev') {
                stream.pipe(gulpUglify({
                    mangle: false
                })).pipe(gulpConcat(filename + '.min.js')).pipe(gulp.dest(plugins.config.projectTmpPath));
            }
            return stream;
        }

        /*
         * @param {Function} filter
         * @param {String} filename
         * @returns {Object}
         */
        function buildVendorScripts(filter, filename) {
            var dependenciesFiles;
            dependenciesFiles = mainBowerFiles({
                paths: {
                    bowerDirectory: path.join(plugins.config.projectRootPath, 'bower_components'),
                    bowerrc: path.join(plugins.config.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(plugins.config.projectRootPath, 'bower.json')
                },
                filter: filter
            });
            return buildScriptsStream(dependenciesFiles, filename);
        }

        /*
         * @param {String} filename
         * @returns {Object}
         */
        function buildProjectScripts(filename) {
            return buildScriptsStream(projectFiles, filename);
        }

        /*
         * @param {String} path
         * @returns {Boolean}
         */
        function nonBbDependenciesFilter(path) {
            return (path.match(new RegExp('.js$'))) && (path.indexOf('bookingbug-angular-') === -1);
        }

        /*
         * @param {String} path
         * @returns {Boolean}
         */
        function bbDependenciesNoTemplatesFilter(path) {
            var isBookingBugDependency;
            isBookingBugDependency = path.indexOf('bookingbug-angular-') !== -1;
            return isBookingBugDependency && path.match(new RegExp('.js$')) && !path.match(new RegExp('-templates.js$'));
        }

        /*
         * @param {String} path
         * @returns {Boolean}
         */
        function bbDependenciesOnlyTemplatesFilter(path) {
            var isBookingBugDependency;
            isBookingBugDependency = path.indexOf('bookingbug-angular-') !== -1;
            return isBookingBugDependency && path.match(new RegExp('-templates.js$'));
        }

    };

}).call(this);
