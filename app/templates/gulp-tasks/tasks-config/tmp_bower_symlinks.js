(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-bower-symlinks', bowerSymlinksTask);

        var fs = require('fs');
        var gulpShell = require('gulp-shell');
        var jsonFile = require('jsonfile');
        var localSdkDependencies = require('../helpers/local_sdk_dependencies');

        var path = require('path');

        function bowerSymlinksTask(cb) {

            if (configuration.projectConfig.local_sdk === true) {
                createSymlinks();
                overrideBBDependenciesInSDKBuilds();
            }

            cb();
        }

        function createSymlinks() {

            var commandsToExecute = [
                localSdkDependencies.generateSymlinkCommand('admin'),
                localSdkDependencies.generateSymlinkCommand('admin-booking'),
                localSdkDependencies.generateSymlinkCommand('admin-dashboard'),
                localSdkDependencies.generateSymlinkCommand('core'),
                localSdkDependencies.generateSymlinkCommand('events'),
                localSdkDependencies.generateSymlinkCommand('member'),
                localSdkDependencies.generateSymlinkCommand('public-booking'),
                localSdkDependencies.generateSymlinkCommand('services'),
                localSdkDependencies.generateSymlinkCommand('settings')
            ];

            gulp.src('').pipe(gulpShell(commandsToExecute, {ignoreErrors: true}));
        }

        function overrideBBDependenciesInSDKBuilds() {

            for (var depIndex in configuration.bbDependencies) {
                var depName = configuration.bbDependencies[depIndex];

                var sdkBowerPath = path.join(configuration.sdkRootPath, 'build', depName, 'bower.json');
                var sdkBowerJson = JSON.parse(fs.readFileSync(sdkBowerPath, 'utf8'));

                for (var dep in sdkBowerJson.dependencies) {
                    if (localSdkDependencies.isBBDependency(dep)) {
                        sdkBowerJson.dependencies[dep] = localSdkDependencies.generatePathToSdkBuild(dep);
                    }
                }

                jsonFile.writeFile(sdkBowerPath, sdkBowerJson, function (err) {
                    if (err !== null) {
                        return console.log(err);
                    }
                });
            }
        }

    };

}).call(this);
