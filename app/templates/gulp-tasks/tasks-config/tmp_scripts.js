(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('tmp-scripts:vendors', scriptsVendorsTask);
        gulp.task('tmp-scripts:sdk-no-templates', scriptsSdkNoTemplates);
        gulp.task('tmp-scripts:sdk-only-templates', scriptsSdkOnlyTemplates);
        gulp.task('tmp-scripts:client', scriptsClient);
        gulp.task('tmp-scripts:watch', scriptsWatch);

        var args = require('../helpers/args.js');
        var gulpCoffee = require('gulp-coffee');
        var gulpConcat = require('gulp-concat');
        var gulpIf = require('gulp-if');
        var gulpUglify = require('gulp-uglify');
        var gulpUtil = require('gulp-util');
        var mainBowerFiles = require('main-bower-files');

        var projectFiles = [
            plugins.config.projectRootPath + '/src/javascripts/**/*.js',
            plugins.config.projectRootPath + '/src/javascripts/**/*.js.coffee',
            '!**/*.spec.js',
            '!**/*.spec.js.coffee',
            '!**/*.js.js',
            '!**/*.js.map'
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

            gulp.watch(projectFiles, ['tmp-scripts:client', 'webserver:reload']);

            gulp.watch([plugins.config.sdkRootPath + '/src/admin/javascripts/**/*'], ['build-sdk:admin:javascripts']);
            gulp.watch([plugins.config.sdkRootPath + '/src/admin-booking/javascripts/**/*'], ['build-sdk:admin-booking:javascripts']);
            gulp.watch([plugins.config.sdkRootPath + '/src/admin-dashboard/javascripts/**/*'], ['build-sdk:admin-dashboard:javascripts']);
            gulp.watch([plugins.config.sdkRootPath + '/src/core/javascripts/**/*'], ['build-sdk:core:javascripts']);
            gulp.watch([plugins.config.sdkRootPath + '/src/events/javascripts/**/*'], ['build-sdk:events:javascripts']);
            gulp.watch([plugins.config.sdkRootPath + '/src/member/javascripts/**/*'], ['build-sdk:member:javascripts']);
            gulp.watch([plugins.config.sdkRootPath + '/src/public-booking/javascripts/**/*'], ['build-sdk:public-booking:javascripts']);
            gulp.watch([plugins.config.sdkRootPath + '/src/services/javascripts/**/*'], ['build-sdk:services:javascripts']);
            gulp.watch([plugins.config.sdkRootPath + '/src/settings/javascripts/**/*'], ['build-sdk:settings:javascripts']);

            gulp.watch(
                [
                    plugins.config.projectRootPath + '/bower_components/bookingbug-angular-*/*.js',
                    '!' + plugins.config.projectRootPath + '/bower_components/bookingbug-angular-*/*-templates.js'
                ],
                ['tmp-scripts:sdk-no-templates', 'webserver:reload']
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
