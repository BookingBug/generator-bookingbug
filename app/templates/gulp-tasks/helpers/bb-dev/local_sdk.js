(function () {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var projectConfig = require('./project_config');
    var sdkSrcDir = process.env.BB_SDK_SRC_DIR;

    module.exports = {
        generatePathToSdkBuild: generatePathToSdkBuild,
        generateSymlinkCommand: generateSymlinkCommand,
        isBBDependency: isBBDependency,
        validate: validate
    };

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
        return path.join(sdkSrcDir, 'build', dependencyName.replace('bookingbug-angular-', ''), '/');
    }

    /*
     * @param {String} sdkDependency
     */
    function generateSymlinkCommand(sdkDependency) {
        var sdkPath = path.join(sdkSrcDir, 'build', sdkDependency);
        var clientPath = path.join(__dirname, '../../bower_components/bookingbug-angular-' + sdkDependency);

        return "ln -s '" + sdkPath + "' '" + clientPath + "'";
    }

    function validate() {

        try {
            if (projectConfig.getConfig().local_sdk === true) {
                fs.accessSync(sdkSrcDir, fs.F_OK);
            }
        } catch (e) {
            console.log('Could not find local BB SDK project using environmental variable BB_SDK_SRC_DIR="' +
                sdkSrcDir + '". Please make sure that BB_SDK_SRC_DIR points to proper directory.');
            process.exit(1);
        }
    }

}).call(this);