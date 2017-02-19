(function () {
    'use strict';

    const del = require('del');
    const fs = require('fs');
    const jsonFile = require('jsonfile');
    const localSdk = require('../helpers/local_sdk');
    const mkdirp = require('mkdirp');
    const path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('bower-prepare', bowerPrepareTask);

        function bowerPrepareTask(cb) {

            mkdirp.sync(path.join(configuration.projectTmpPath));

            cleanUpBowerComponents();

            if (configuration.projectConfig.build.local_sdk === true) {
                prepareBowerFileReferringToLocalSdk();
                createSymlinks();
                overrideBBDependenciesInSDKBuilds();
                cb();
            } else {
                return copyBowerFileToReleaseDir();
            }
        }

        function cleanUpBowerComponents() {
            mkdirp.sync(path.join(configuration.projectRootPath, 'bower_components'));
            let bbDependenciesToDelete = path.join(configuration.projectRootPath, 'bower_components/bookingbug-angular-*');
            del.sync([bbDependenciesToDelete]);
        }

        function copyBowerFileToReleaseDir() {
            return gulp.src(path.join(configuration.projectRootPath, 'bower.json')).pipe(gulp.dest(configuration.projectTmpPath));
        }

        function prepareBowerFileReferringToLocalSdk() {
            let bowerOriginalJsonPath = path.join(configuration.projectRootPath, 'bower.json');
            let bowerJsonPath = path.join(configuration.projectTmpPath, 'bower.json');

            let bowerJson = JSON.parse(fs.readFileSync(bowerOriginalJsonPath, 'utf8'));

            useLocalPaths(bowerJson);

            jsonFile.writeFileSync(bowerJsonPath, bowerJson, {spaces: 2});
        }

        /**
         * @param {Object} bowerJson
         */
        function useLocalPaths(bowerJson) {
            for (let depName in bowerJson.dependencies) {
                if (localSdk.isBBDependency(depName)) {
                    bowerJson.dependencies[depName] = localSdk.generatePathToSdkBuild(depName);
                }
            }
        }

        function createSymlinks() {

            for (let depKey in configuration.bbDependencies) {
                let depName = configuration.bbDependencies[depKey];
                localSdk.createSymlink(depName);
            }
        }

        function overrideBBDependenciesInSDKBuilds() {

            for (let depIndex in configuration.bbDependencies) {
                let depName = configuration.bbDependencies[depIndex];

                let sdkBowerPath = path.join(configuration.sdkRootPath, 'build', depName, 'bower.json');
                let sdkBowerJson = JSON.parse(fs.readFileSync(sdkBowerPath, 'utf8'));

                for (let dep in sdkBowerJson.dependencies) {
                    if (localSdk.isBBDependency(dep)) {
                        sdkBowerJson.dependencies[dep] = localSdk.generatePathToSdkBuild(dep);
                    }
                }

                jsonFile.writeFileSync(sdkBowerPath, sdkBowerJson, {spaces: 2});
            }
        }

    };

})();
