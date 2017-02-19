(function () {
    'use strict';

    const runSequence = require('run-sequence');

    module.exports = function (gulp, configuration) {

        gulp.task('deploy', deployTask);

        function deployTask(cb) {
            configuration.deploy = true;
            runSequence('checkout', 'release', 'deploy-aws', 'checkout-master', cb);
        }
    };

})();
