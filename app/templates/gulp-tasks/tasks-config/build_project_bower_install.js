(function () {
    module.exports = function (gulp, plugins, path) {

        var args = require('../helpers/args.js');
        var del = require('del');
        var gulpBower = require('gulp-bower');
        var gulpShell = require('gulp-shell');
        var mkdirp = require('mkdirp');


        gulp.task('build-project-bower-install', bowerInstallTask);

        function bowerInstallTask() {

            mkdirp.sync(path.join(plugins.config.projectRootPath, 'bower_components'));

            var delPathGlob = path.join(plugins.config.projectRootPath, 'bower_components/bookingbug-angular-*');
            del.sync([delPathGlob]);

            gulp.src('').pipe(gulpShell(
                [
                    generateSymlinkCommand('admin'),
                    generateSymlinkCommand('admin-booking'),
                    generateSymlinkCommand('admin-dashboard'),
                    generateSymlinkCommand('core'),
                    generateSymlinkCommand('events'),
                    generateSymlinkCommand('member'),
                    generateSymlinkCommand('public-booking'),
                    generateSymlinkCommand('services'),
                    generateSymlinkCommand('settings')
                ],
                {
                    ignoreErrors: true
                }
            ));
            return gulpBower({
                cwd: plugins.config.projectRootPath,
                directory: './bower_components'
            });
        }

        /*
         * @param {String} sdkDependency
         */
        function generateSymlinkCommand(sdkDependency) {
            var sdkDependencyBuildPath = path.join(plugins.config.sdkRootPath, 'build', sdkDependency);
            var sdkDependencyProjectPath = path.join(plugins.config.projectRootPath, '/bower_components/bookingbug-angular-' + sdkDependency);

            return "ln -s '" + sdkDependencyBuildPath + "' '" + sdkDependencyProjectPath + "'";
        }
    };

}).call(this);
