(function () {
    'use strict';

    var gulpCoffee = require('gulp-coffee');
    var gulpConcat = require('gulp-concat');
    var gulpIf = require('gulp-if');
    var gulpUglify = require('gulp-uglify');
    var gulpUtil = require('gulp-util');
    var mainBowerFiles = require('main-bower-files');
    var path = require('path');
    var template = require('gulp-template');

    module.exports = function (gulp, configuration) {

        gulp.task('scripts:vendors', scriptsVendorsTask);
        gulp.task('scripts:client', scriptsClient);


        function scriptsVendorsTask() {
            var dependenciesFiles = mainBowerFiles({
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

            var sdkFiles = mainBowerFiles({
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

        function getVersion() {
            var sdk_version;
            var project_version;
            if (configuration.projectConfig.local_sdk) {
              sdk_version = '?';
            } else {
              var dependencies = require('../../bower.json').dependencies;
              for (var key in dependencies) {
                if (key.match(/bookingbug-angular/)) {
                  sdk_version = 'v' + dependencies[key];
                }
              }
            }
            if (configuration.deploy && configuration.projectConfig.deploy_version) {
              project_version = configuration.projectConfig.deploy_version;
            } else {
              project_version = '?';
            }
            return {
                project: '"' + project_version + '"',
                sdk: '"' + sdk_version + '"',
                name: configuration.projectConfig.app_name
            };
        }

        /*
         * @param {Array.<String>} files
         * @param {String} filename
         */
        function buildScriptsStream(files, filename) {
            var stream = gulp.src(files)
                    .pipe(gulpIf(/.*main.version.js.coffee$/, template(getVersion())))
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

    };

}).call(this);
