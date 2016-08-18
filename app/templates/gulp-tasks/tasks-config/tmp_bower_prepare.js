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

            for (var depName in bowerJson.dependencies) {
                if (localSdkDependencies.isBBDependency(depName)) {
                    bowerJson.dependencies[depName] = localSdkDependencies.generatePathToSdkBuild(depName);
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

    };

}).call(this);
