(function () {
    'use strict';

    const del = require('del');
    const mkdirp = require('mkdirp');

    module.exports = function (gulp, configuration) {

        gulp.task('clean', cleanTask);

        function cleanTask(cb) {

            del.sync([configuration.projectReleasePath]);
            mkdirp.sync(configuration.projectReleasePath);

            cb();
        }

    };

})();
