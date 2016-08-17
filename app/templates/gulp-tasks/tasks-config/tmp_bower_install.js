(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-bower-install', bowerInstallTask);

        var gulpBower = require('gulp-bower');
        var mkdirp = require('mkdirp');
        var path = require('path');

        function bowerInstallTask() {

            mkdirp.sync(path.join(configuration.projectRootPath, 'bower_components'));

            return gulpBower({
                cwd: configuration.projectTmpPath,
                directory: '../bower_components'
            });
        }
    };

}).call(this);
