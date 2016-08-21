(function () {
    'use strict';

    var cs = require('coffee-script');
    var fs = require('fs');
    var gulp = require('gulp');
    var path = require('path');
    var projectConfig = require('./gulp-tasks/helpers/project_config');
    var localSdk = require('./gulp-tasks/helpers/local_sdk.js');
    var sdkSrcDir = process.env.BB_SDK_SRC_DIR;

    if (projectConfig.getConfig().local_sdk === true) {
        localSdk.validate();
        cs.register();
        require(path.join(sdkSrcDir, 'gulp-tasks/gulpfile.js.coffee'))(gulp, sdkSrcDir);
    }

    require('./gulp-tasks/gulpfile.js')(gulp, __dirname, sdkSrcDir);

})(this);
