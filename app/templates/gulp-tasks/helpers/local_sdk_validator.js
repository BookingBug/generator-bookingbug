(function () {

    'use strict';

    module.exports = {
        validate: validate
    };

    var projectConfig = require('./project_config');
    var fs = require('fs');
    var path = require('path');

    var sdkSrcDir = process.env.BB_SDK_SRC_DIR;

    function validate() {

        try {
            if (projectConfig.getConfig().local_sdk === true) {
                fs.accessSync(sdkSrcDir, fs.F_OK);
            }
        } catch (e) {
            console.log('Could not find local BB SDK project using environmental variable BB_SDK_SRC_DIR="' + sdkSrcDir + '". Please make sure that BB_SDK_SRC_DIR points to proper directory.');
            process.exit(1);
        }
    }

}).call(this);
