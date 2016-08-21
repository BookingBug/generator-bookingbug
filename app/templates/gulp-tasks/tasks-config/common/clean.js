(function () {
    'use strict';

    var del = require('del');
    var mkdirp = require('mkdirp');

    module.exports = function (gulp, configuration) {

        gulp.task('clean', cleanTask);

        function cleanTask(cb) {

            del.sync([configuration.projectReleasePath]);
            mkdirp.sync(configuration.projectReleasePath);

            cb();
        }

    };

}).call(this);
