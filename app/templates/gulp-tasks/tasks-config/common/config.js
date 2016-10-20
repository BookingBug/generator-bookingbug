(function () {
    'use strict';

    var deepMerge = require('deepmerge');
    var deepRenameKeys = require('deep-rename-keys');
    var gulpNgConstant = require('gulp-ng-constant');
    var gulpRename = require('gulp-rename');
    var jsonFile = require('jsonfile');
    var mainBowerFiles = require('main-bower-files');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('config', configTask);

        function configTask() {

            var configProject = JSON.parse(JSON.stringify(configuration.projectConfig));

            var configSdk = {};

            getSdkConfigFileNames().forEach(function (configFileName) {
                var configData = getConfigData(configFileName);
                configSdk = deepMerge(configSdk, configData);
            });

            configProject = deepMerge(configSdk, configProject);
            configProject = deepRenameKeys(configProject, upperCaseKey);

            var options = {
                constants: {
                    bbConfig: configProject
                },
                deps: false,
                merge: true,
                name: "BB",
                space: '    ',
                stream: true,
                wrap: false
            };

            return gulpNgConstant(options)
                .pipe(gulpRename('config.constants.js'))
                .pipe(gulp.dest(configuration.projectTmpPath));
        }

        /**
         * @param {String} key
         * @returns {String}
         */
        function upperCaseKey(key) {
            return key.toUpperCase();
        }

        /**
         * @param {String} fileName
         * @returns {Object}
         */
        function getConfigData(fileName) {
            try {
                return jsonFile.readFileSync(fileName);
            } catch (error) {
                console.log('Could not load config file.', error);
                process.exit(0);
            }
        }

        /**
         * @returns {Array.<String>}
         */
        function getSdkConfigFileNames() {
            return mainBowerFiles({
                paths: {
                    bowerDirectory: path.join(configuration.projectRootPath, 'bower_components'),
                    bowerrc: path.join(configuration.projectRootPath, '.bowerrc'),
                    bowerJson: path.join(configuration.projectRootPath, 'bower.json')
                },
                filter: function (path) {
                    var isBookingBugDependency = path.indexOf('bookingbug-angular-') !== -1;
                    return isBookingBugDependency && path.match(new RegExp('\/config\/.*.json$'));
                }
            });
        }

    };

}).call(this);
