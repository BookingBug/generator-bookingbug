(function () {
    'use strict';

    var del = require('del');
    var fs = require('fs');
    var jsonFile = require('jsonfile');
    var localSdk = require('../helpers/local_sdk');
    var mkdirp = require('mkdirp');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('bower-prepare', bowerPrepareTask);

        function bowerPrepareTask(cb) {

            cleanUpBowerComponents();

            if (configuration.projectConfig.local_sdk === true) {
                prepareBowerFileReferringToLocalSdk();
                cb();
            } else {
                return copyBowerFileToReleaseDir();
            }
        }

        function cleanUpBowerComponents() {
            mkdirp.sync(path.join(configuration.projectRootPath, 'bower_components'));
            var bbDependenciesToDelete = path.join(configuration.projectRootPath, 'bower_components/bookingbug-angular-*');
            del.sync([bbDependenciesToDelete]);
        }

        function copyBowerFileToReleaseDir() {
            return gulp.src(path.join(configuration.projectRootPath, 'bower.json')).pipe(gulp.dest(configuration.projectTmpPath));
        }

        function prepareBowerFileReferringToLocalSdk() {
            var bowerOriginalJsonPath = path.join(configuration.projectRootPath, 'bower.json');
            var bowerJsonPath = path.join(configuration.projectTmpPath, 'bower.json');

            var bowerJson = JSON.parse(fs.readFileSync(bowerOriginalJsonPath, 'utf8'));

            useLocalPaths(bowerJson);

            overwriteResolutions(bowerJson);

            jsonFile.writeFile(bowerJsonPath, bowerJson, function (err) {
                if (err !== null) {
                    return console.log(err);
                }
            });
        }

        /**
         * @param {Object} bowerJson
         */
        function useLocalPaths(bowerJson) {
            for (var depName in bowerJson.dependencies) {
                if (localSdk.isBBDependency(depName)) {
                    bowerJson.dependencies[depName] = localSdk.generatePathToSdkBuild(depName);
                }
            }
        }

        /**
         * @param {Object} bowerJson
         */
        function overwriteResolutions(bowerJson) {
            for (var depKey in configuration.bbDependencies) {
                var bowerDependencyName = 'bookingbug-angular-' + configuration.bbDependencies[depKey];
                bowerJson.resolutions[bowerDependencyName] = "*";
            }
        }

    };

}).call(this);
