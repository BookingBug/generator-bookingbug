(function () {
    'use strict';

    var runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('deploy', deployTask);

        function deployTask(cb) {
            runSequence('release', 'deploy-aws', cb);
        }
    };

}).call(this);
