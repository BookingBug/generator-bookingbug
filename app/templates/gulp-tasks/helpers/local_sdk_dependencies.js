(function () {

    'use strict';

    module.exports = {
        generatePathToSdkBuild: generatePathToSdkBuild,
        isBBDependency: isBBDependency,
        generateSymlinkCommand: generateSymlinkCommand
    };

    var sdkSrcDir = process.env.BB_SDK_SRC_DIR;
    var path = require('path');

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

}).call(this);
