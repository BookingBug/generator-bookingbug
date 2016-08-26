(function () {
    'use strict';

    var fs = require('fs');
    var jsonFile = require('jsonfile');
    var localSdk = require('../helpers/local_sdk');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('bower-symlinks', bowerSymlinksTask);

        function bowerSymlinksTask(cb) {

            if (configuration.projectConfig.local_sdk === true) {
                createSymlinks();
                overrideBBDependenciesInSDKBuilds();
            }

            cb();
        }

        function createSymlinks() {

            for (var depKey in configuration.bbDependencies) {
                var depName = configuration.bbDependencies[depKey];
                localSdk.createSymlink(depName);
            }
        }

        function overrideBBDependenciesInSDKBuilds() {

            for (var depIndex in configuration.bbDependencies) {
                var depName = configuration.bbDependencies[depIndex];

                var sdkBowerPath = path.join(configuration.sdkRootPath, 'build', depName, 'bower.json');
                var sdkBowerJson = JSON.parse(fs.readFileSync(sdkBowerPath, 'utf8'));

                for (var dep in sdkBowerJson.dependencies) {
                    if (localSdk.isBBDependency(dep)) {
                        sdkBowerJson.dependencies[dep] = localSdk.generatePathToSdkBuild(dep);
                    }
                }

                jsonFile.writeFile(sdkBowerPath, sdkBowerJson, {spaces: 2}, function (err) {
                    if (err !== null) {
                        return console.log(err);
                    }
                });
            }
        }

    };

}).call(this);
