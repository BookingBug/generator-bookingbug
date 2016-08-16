(function () {
    module.exports = function (gulp, plugins, path) {

        var fs = require('fs');
        var jsonFile = require('jsonfile');

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

        gulp.task('build-project-bower-prepare', bowerPrepareTask);

        function bowerPrepareTask(cb) {

            var bowerOriginalJsonPath = path.join(plugins.config.projectRootPath, '_bower.json');
            var bowerJsonPath = path.join(plugins.config.projectRootPath, 'bower.json');
            var bowerJson = JSON.parse(fs.readFileSync(bowerOriginalJsonPath, 'utf8'));

            var ref = bowerJson.dependencies;
            for (var depName in ref) {
                if (isBBDependency(depName)) {
                    bowerJson.dependencies[depName] = generatePathToSdkBuild(depName);
                }
            }

            for (var i = 0, len = bowerBBDependencies.length; i < len; i++) {
                var depName = bowerBBDependencies[i];
                if (typeof bowerJson.resolutions[depName] === 'undefined') {
                    bowerJson.resolutions[depName] = "*";
                }
            }

            jsonFile.writeFile(bowerJsonPath, bowerJson, function (err) {
                if (err !== null) {
                    return console.log(err);
                }
            });

            cb();
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
            return path.join(plugins.config.sdkRootPath, 'build', dependencyName.replace('bookingbug-angular-', ''), '/');
        }


    };

}).call(this);
