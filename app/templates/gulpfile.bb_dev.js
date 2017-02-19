(function () {
    'use strict';

    const gulp = require('gulp');
    const path = require('path');
    const projectConfig = require('./gulp-tasks/helpers/project_config');
    const localSdk = require('./gulp-tasks/helpers/local_sdk.js');
    const sdkSrcDir = process.env.BB_SDK_SRC_DIR;

    if (projectConfig.getConfig().build.local_sdk === true) {
        localSdk.validate();
        require(path.join(sdkSrcDir, 'gulp-tasks/gulpfile.js'))(gulp, sdkSrcDir);
    }

    require('./gulp-tasks/gulpfile.js')(gulp, __dirname, sdkSrcDir);

})();
