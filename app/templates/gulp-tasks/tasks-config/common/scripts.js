(function () {
    'use strict';

    const babel = require('gulp-babel');
    const gulpConcat = require('gulp-concat');
    const gulpIf = require('gulp-if');
    const gulpUglify = require('gulp-uglify');
    const gulpUtil = require('gulp-util');
    const mainBowerFiles = require('main-bower-files');
    const path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('scripts:vendors', scriptsVendorsTask);
        gulp.task('scripts:client', scriptsClient);


        function scriptsVendorsTask() {
            let dependenciesFiles = mainBowerFiles({
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: function (path) {
                    return (path.match(new RegExp('.js$'))) && (path.indexOf('bookingbug-angular-') === -1);
                }
            });
            return buildScriptsStream(dependenciesFiles, 'booking-widget-dependencies');
        }

        function scriptsClient() {

            let sdkFiles = mainBowerFiles({
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: function (path) {
                    var isBookingBugDependency = path.indexOf('bookingbug-angular-') !== -1;
                    return isBookingBugDependency && path.match(new RegExp('.js$'));
                }
            });

            let projectFiles = [
                configuration.projectTmpPath + '/config.constants.js',
                configuration.projectRootPath + '/src/javascripts/**/*.module.js',
                configuration.projectRootPath + '/src/javascripts/**/*.js',
                '!' + configuration.projectRootPath + '/src/javascripts/**/*.spec.js'
            ];

            return buildScriptsStream(sdkFiles.concat(projectFiles), 'booking-widget');
        }

        /*
         * @param {Array.<String>} files
         * @param {String} filename
         */
        function buildScriptsStream(files, filename) {
            let stream = gulp.src(files);

            if (filename === 'booking-widget') {
                stream.pipe(gulpIf(/^(?!bookingbug-angular-).*/, babel({presets: ['es2015']})).on('error', gulpUtil.log));
            }

            if (configuration.projectConfig.build.uglify === true) {
                stream
                    .pipe(gulpUglify({mangle: false}))
                    .pipe(gulpConcat(filename + '.js'))
                    .pipe(gulp.dest(configuration.projectReleasePath))
                ;
            } else {
                stream.pipe(gulpConcat(filename + '.js'))
                    .pipe(gulp.dest(configuration.projectReleasePath))
            }

            return stream;
        }

    };

})();
