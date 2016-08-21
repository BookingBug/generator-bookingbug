(function () {
    'use strict';

    var gulpCoffee = require('gulp-coffee');
    var gulpConcat = require('gulp-concat');
    var gulpIf = require('gulp-if');
    var gulpUglify = require('gulp-uglify');
    var gulpUtil = require('gulp-util');
    var mainBowerFiles = require('main-bower-files');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('scripts:vendors', scriptsVendorsTask);
        gulp.task('scripts:sdk-no-templates', scriptsSdkNoTemplates);
        gulp.task('scripts:sdk-only-templates', scriptsSdkOnlyTemplates);
        gulp.task('scripts:client', scriptsClient);

        var projectFiles = [
            configuration.projectRootPath + '/src/javascripts/**/*.js',
            configuration.projectRootPath + '/src/javascripts/**/*.js.coffee',
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

        /*
         * @param {Function} filter
         * @param {String} filename
         * @returns {Object}
         */
        function buildVendorScripts(filter, filename) {
            var dependenciesFiles;
            dependenciesFiles = mainBowerFiles({
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
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
         * @param {Array.<String>} files
         * @param {String} filename
         */
        function buildScriptsStream(files, filename) {
            var stream;
            stream = gulp.src(files)
                .pipe(gulpIf(/.*js.coffee$/, gulpCoffee().on('error', gulpUtil.log)))
                .pipe(gulpConcat(filename + '.js'))
                .pipe(gulp.dest(configuration.projectReleasePath));

            if (configuration.projectConfig.uglify === true) {
                stream.pipe(gulpUglify({
                    mangle: false
                }))
                    .pipe(gulpConcat(filename + '.min.js'))
                    .pipe(gulp.dest(configuration.projectReleasePath));
            }
            return stream;
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
