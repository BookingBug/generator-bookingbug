(function () {
    'use strict';

    var git = require('gulp-git');

    module.exports = function (gulp, configuration) {

        gulp.task('checkout', checkoutTask);
        gulp.task('checkout-master', checkoutMasterTask);

        function checkoutTask(cb) {
            if (configuration.projectConfig.build.deploy_version) {
                git.checkout(configuration.projectConfig.build.deploy_version, function(err) {
                    if (err) throw err;
                    cb();
                });
            } else {
                cb();
            }
        }

        function checkoutMasterTask(cb) {
            if (configuration.projectConfig.build.deploy_version) {
                git.checkout('master', function(err) {
                    if (err) throw err;
                    cb();
                });
            } else {
                cb();
            }
        }

    };

})(this);
