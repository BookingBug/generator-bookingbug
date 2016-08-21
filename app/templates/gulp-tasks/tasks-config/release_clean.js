(function () {
    'use strict';

    var del = require('del');
    var mkdirp = require('mkdirp');

    module.exports = function (gulp, configuration) {

        gulp.task('release-clean', cleanTask);

        function cleanTask(cb) {

            del.sync([configuration.projectTmpPath]);
            mkdirp.sync(configuration.projectTmpPath);

            cb();
        }

    };

}).call(this);
