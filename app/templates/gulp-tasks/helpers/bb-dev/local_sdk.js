(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const projectConfig = require('./project_config');
    const sdkSrcDir = process.env.BB_SDK_SRC_DIR;

    module.exports = {
        createSymlink: createSymlink,
        generatePathToSdkBuild: generatePathToSdkBuild,
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

    function validate() {

        try {
            if (projectConfig.getConfig().build.local_sdk === true) {
                fs.accessSync(sdkSrcDir, fs.F_OK);
            }
        } catch (e) {
            console.log('Could not find local BB SDK project using environmental variable BB_SDK_SRC_DIR="' +
                sdkSrcDir + '". Please make sure that BB_SDK_SRC_DIR points to proper directory.');
            process.exit(1);
        }
    }

    function createSymlink(sdkDependency) {

        let isWin = process.platform === 'win32';
        let src = path.join(sdkSrcDir, 'build', sdkDependency);
        let dest = path.join(__dirname, '../../bower_components/bookingbug-angular-' + sdkDependency);

        try {
            fs.symlinkSync(src, dest, 'dir');
        } catch (error) {

            if (!isWin || error.code !== 'EPERM') {
                console.log('Could not create symlink. ', error);
                process.exit(1);
            }

            try {
                fs.symlinkSync(src, dest, 'junction')
            } catch (error) {
                console.log('Could not create symlink. ', error);
                process.exit(1);
            }
        }
    }


})();
