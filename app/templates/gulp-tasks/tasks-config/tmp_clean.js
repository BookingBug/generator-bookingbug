(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        gulp.task('tmp-clean', cleanTask);

        var del = require('del');

        function cleanTask(cb) {
            del.sync([configuration.projectTmpPath]);
            cb();
        }
    };

}).call(this);
