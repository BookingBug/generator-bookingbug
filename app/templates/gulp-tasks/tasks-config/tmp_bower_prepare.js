(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-bower-prepare', bowerPrepareTask);

        var del = require('del');
        var fs = require('fs');
        var jsonFile = require('jsonfile');
        var localSdkDependencies = require('../helpers/local_sdk_dependencies');
        var mkdirp = require('mkdirp');
        var path = require('path');

        function bowerPrepareTask(cb) {

            cleanUpBowerComponents();

            if (configuration.projectConfig.local_sdk === true) {
                prepareBowerFileReferringToLocalSdk();
                cb();
            } else {
                return copyBowerFileToTmp();
            }
        }

        function cleanUpBowerComponents() {
            mkdirp.sync(path.join(configuration.projectRootPath, 'bower_components'));
            var bbDependenciesToDelete = path.join(configuration.projectRootPath, 'bower_components/bookingbug-angular-*');
            del.sync([bbDependenciesToDelete]);
        }

        function copyBowerFileToTmp() {
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
                if (localSdkDependencies.isBBDependency(depName)) {
                    bowerJson.dependencies[depName] = localSdkDependencies.generatePathToSdkBuild(depName);
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
