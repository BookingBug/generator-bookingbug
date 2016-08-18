(function () {
    module.exports = function (gulp, configuration) {

        gulp.task('deploy', deployTask);

        var runSequence = require('run-sequence');

        function deployTask(cb) {
            runSequence('build-tmp', 'deploy-aws', cb);
        }
    };

}).call(this);
