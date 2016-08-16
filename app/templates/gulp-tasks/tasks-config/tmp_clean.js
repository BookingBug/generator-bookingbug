(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('tmp-clean', cleanTask);

        var del = require('del');

        function cleanTask(cb) {
            del.sync([plugins.config.projectTmpPath]);
            cb();
        }
    };

}).call(this);
