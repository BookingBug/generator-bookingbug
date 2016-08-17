(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-clean', cleanTask);

        var del = require('del');
        var mkdirp = require('mkdirp');

        function cleanTask(cb) {

            del.sync([configuration.projectTmpPath]);
            mkdirp.sync(configuration.projectTmpPath);

            cb();
        }

    };

}).call(this);
