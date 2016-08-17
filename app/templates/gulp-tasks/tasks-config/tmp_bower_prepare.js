(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-bower-prepare', bowerPrepareTask);

        var fs = require('fs');
        var jsonFile = require('jsonfile');
        var path = require('path');

        var bowerBBDependencies = [
            'bookingbug-angular-admin',
            'bookingbug-angular-admin-booking',
            'bookingbug-angular-admin-dashboard',
            'bookingbug-angular-core',
            'bookingbug-angular-events',
            'bookingbug-angular-member',
            'bookingbug-angular-public-booking',
            'bookingbug-angular-services',
            'bookingbug-angular-settings'
        ];

        function bowerPrepareTask(cb) {

            if (configuration.projectConfig.local_sdk === true) {
                prepareBowerFileReferringToLocalSdk();
                cb();
            } else {
                return copyBowerFileToTmp();
            }


        }

        function copyBowerFileToTmp() {
            return gulp.src(path.join(configuration.projectRootPath, 'bower.json')).pipe(gulp.dest(configuration.projectTmpPath));
        }

        function prepareBowerFileReferringToLocalSdk() {
            var bowerOriginalJsonPath = path.join(configuration.projectRootPath, 'bower.json');
            var bowerJsonPath = path.join(configuration.projectTmpPath, 'bower.json');

            var bowerJson = JSON.parse(fs.readFileSync(bowerOriginalJsonPath, 'utf8'));

            for (var depName in bowerJson.dependencies) {
                if (isBBDependency(depName)) {
                    bowerJson.dependencies[depName] = generatePathToSdkBuild(depName);
                }
            }

            for (var i = 0; i < bowerBBDependencies.length; i++) {
                var depName = bowerBBDependencies[i];
                bowerJson.resolutions[depName] = "*";
            }

            jsonFile.writeFile(bowerJsonPath, bowerJson, function (err) {
                if (err !== null) {
                    return console.log(err);
                }
            });
        }

        /*
         * @param {String} dependencyName
         * @returns {Boolean}
         */
        function isBBDependency(dependencyName) {
            return new RegExp(/^bookingbug-angular.*/).test(dependencyName);
        }

        /*
         *@param {String} dependencyName
         */
        function generatePathToSdkBuild(dependencyName) {
            return path.join(configuration.sdkRootPath, 'build', dependencyName.replace('bookingbug-angular-', ''), '/');
        }


    };

}).call(this);