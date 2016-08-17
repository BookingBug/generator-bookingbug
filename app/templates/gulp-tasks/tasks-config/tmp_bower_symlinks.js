(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-bower-symlinks', bowerSymlinksTask);

        var del = require('del');
        var fs = require('fs');
        var gulpShell = require('gulp-shell');
        var jsonFile = require('jsonfile');
        var mkdirp = require('mkdirp');
        var path = require('path');

        function bowerSymlinksTask(cb) {

            mkdirp.sync(path.join(configuration.projectRootPath, 'bower_components'));

            var delPathGlob = path.join(configuration.projectRootPath, 'bower_components/bookingbug-angular-*');
            del.sync([delPathGlob]);

            gulp.src('').pipe(gulpShell(
                [
                    generateSymlinkCommand('admin'),
                    generateSymlinkCommand('admin-booking'),
                    generateSymlinkCommand('admin-dashboard'),
                    generateSymlinkCommand('core'),
                    generateSymlinkCommand('events'),
                    generateSymlinkCommand('member'),
                    generateSymlinkCommand('public-booking'),
                    generateSymlinkCommand('services'),
                    generateSymlinkCommand('settings')
                ],
                {
                    ignoreErrors: true
                }
            ));

            overrideBBDependenciesInSDKBuilds();

            cb();
        }

        function overrideBBDependenciesInSDKBuilds(){

            for(var depIndex in configuration.bbDependencies){
                var depName = configuration.bbDependencies[depIndex];

                var sdkBowerPath = path.join(configuration.sdkRootPath, 'build', depName, 'bower.json');
                var sdkBowerJson = JSON.parse(fs.readFileSync(sdkBowerPath, 'utf8'));

                for (var dep in sdkBowerJson.dependencies) {
                    if (isBBDependency(dep)) {
                        sdkBowerJson.dependencies[dep] = generatePathToSdkBuild(dep);
                    }
                }

                jsonFile.writeFile(sdkBowerPath, sdkBowerJson, function (err) {
                    if (err !== null) {
                        return console.log(err);
                    }
                });

            }

        }

        /*
         * @param {String} dependencyName
         * @returns {Boolean}
         */
        function isBBDependency(dependencyName) {
            return new RegExp(/^bookingbug-angular.*/).test(dependencyName);
        }

        /*
         * @param {String} sdkDependency
         */
        function generateSymlinkCommand(sdkDependency) {
            var sdkPath = path.join(configuration.sdkRootPath, 'build', sdkDependency);
            var clientPath = path.join(configuration.projectRootPath, '/bower_components/bookingbug-angular-' + sdkDependency);

            return "ln -s '" + sdkPath + "' '" + clientPath + "'";
        }

        /*
         *@param {String} dependencyName
         */
        function generatePathToSdkBuild(dependencyName) {
            return path.join(configuration.sdkRootPath, 'build', dependencyName.replace('bookingbug-angular-', ''), '/');
        }
    };

}).call(this);
