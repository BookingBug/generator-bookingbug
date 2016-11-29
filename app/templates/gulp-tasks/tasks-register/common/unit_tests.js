(function () {
    'use strict';

    module.exports = function (gulp, configuration) {

        var runSequence = require('run-sequence').use(gulp);

        gulp.task('unit-tests', function (cb) {
            runSequence('release', 'unit-tests-start-karma', cb);
        });
        gulp.task('unit-tests:watch', function (cb) {
            runSequence('run:watch', 'unit-tests-start-karma:watch', cb);
        });
    };

}).call(this);
