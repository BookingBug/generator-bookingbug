(function () {
    'use strict';

    var gulp = require('gulp');
    var path = require('path');
    var projectConfig = require('./gulp-tasks/helpers/project_config');
    var localSdk = require('./gulp-tasks/helpers/local_sdk.js');
    var sdkSrcDir = process.env.BB_SDK_SRC_DIR;
    var deploy = false;

    if (projectConfig.getConfig().build.local_sdk === true) {
        localSdk.validate();
        require(path.join(sdkSrcDir, 'gulp-tasks/gulpfile.js'))(gulp, sdkSrcDir);
    }

    require('./gulp-tasks/gulpfile.js')(gulp, __dirname, sdkSrcDir);

})(this);
