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
        gulp.task('scripts:client', scriptsClient);
        gulp.task('scripts:lazy', scriptsLazy);

        function scriptsVendorsTask() {
            var dependenciesFiles = mainBowerFiles({
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: function (path) {
                    var isJs = path.match(new RegExp('.js$'));
                    var isNotBB = path.indexOf('bookingbug-angular-') === -1;

                    return isJs && isNotBB;
                }
            });
            return buildScriptsStream(dependenciesFiles, 'booking-widget-dependencies');
        }

        function scriptsClient() {

            var sdkFiles = mainBowerFiles({
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: function (path) {
                    var isJs = path.match(new RegExp('.js$'));
                    var isBB = path.indexOf('bookingbug-angular-') !== -1;
                    var isNotLazy = !path.match(new RegExp('(bower_components\/bookingbug-angular-).+(\.lazy\.)'));

                    return isJs && isBB && isNotLazy;
                }
            });

            var projectFiles = [
                configuration.projectRootPath + '/src/javascripts/**/*.module.js',
                configuration.projectRootPath + '/src/javascripts/**/*.module.js.coffee',
                configuration.projectRootPath + '/src/javascripts/**/*.js',
                configuration.projectRootPath + '/src/javascripts/**/*.js.coffee',
                '!' + configuration.projectRootPath + '/src/javascripts/**/*.spec.js',
                '!' + configuration.projectRootPath + '/src/javascripts/**/*.spec.js.coffee',
                '!' + configuration.projectRootPath + '/src/javascripts/**/*.js.js',
                '!' + configuration.projectRootPath + '/src/javascripts/**/*.js.map'
            ];

            return buildScriptsStream(sdkFiles.concat(projectFiles), 'booking-widget');
        }

        /*
         * @param {Array.<String>} files
         * @param {String} filename
         */
        function buildScriptsStream(files, filename) {
            var stream = gulp.src(files)
                    .pipe(gulpIf(/.*js.coffee$/, gulpCoffee().on('error', gulpUtil.log)))
                ;

            if (configuration.projectConfig.uglify === true) {
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

        function scriptsLazy() {
            var dependenciesFiles = mainBowerFiles({
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: function (path) {
                    var regex = new RegExp('(bower_components\/bookingbug-angular-).+(\.lazy\.min\.js)');
                    if (configuration.projectConfig.uglify === false) {
                        regex = new RegExp('(bower_components\/bookingbug-angular-).+(\.lazy\.js)');
                    }

                    return path.match(regex);
                }
            });

            return gulp.src(dependenciesFiles)
                .pipe(gulp.dest(configuration.projectReleasePath));
        }
    };

}).call(this);
