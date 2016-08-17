var cs = require('coffee-script');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');

var sdkSrcDir = process.env.BB_SDK_SRC_DIR;

try {
    fs.accessSync(sdkSrcDir, fs.F_OK);
    cs.register();
    var sdkGulpFilePath = path.join(sdkSrcDir, 'gulp-tasks/gulpfile.js.coffee');
    require(sdkGulpFilePath)(gulp, process.env.BB_SDK_SRC_DIR);
} catch (e) {
    console.log('Could not find local BB SDK project using enviroment variable BB_SDK_SRC_DIR="' + sdkSrcDir + '"');
}


var clientGulpFilePath = './gulp-tasks/gulpfile.js';
require(clientGulpFilePath)(gulp, __dirname, sdkSrcDir);
