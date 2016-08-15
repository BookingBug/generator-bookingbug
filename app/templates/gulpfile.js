var cs = require('coffee-script');
var path  = require('path');
var gulp = require('gulp');

var sdkGulpFilePath = path.join(process.env.BB_SDK_SRC_DIR, 'gulp-tasks/gulpfile.js.coffee');
var clientGulpFilePath = './gulp-tasks/gulpfile.js.coffee';

cs.register();

require(sdkGulpFilePath)(gulp, process.env.BB_SDK_SRC_DIR);
require(clientGulpFilePath)(gulp, __dirname, process.env.BB_SDK_SRC_DIR);
