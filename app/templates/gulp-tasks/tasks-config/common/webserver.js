(function () {
    'use strict';

    const gulpConnect = require('gulp-connect');
    const gulpOpen = require('gulp-open');
    const args = require('yargs').argv;

    module.exports = function (gulp, configuration) {

        gulp.task('webserver', webServerTask);
        gulp.task('webserver:open-browser', openBrowserTask);

        function webServerTask () {
            if (!args.secure) {
                console.info('You can start an HTTPS server by running gulp with the --secure flag');
            }

            return gulpConnect.server({
                root: [configuration.projectReleasePath],
                port: configuration.projectConfig.build.server_port,
                livereload: true,
                https: args.secure !== null && args.secure !== undefined
            });
        }

        function openBrowserTask () {
            const protocol = (args.secure !== null && args.secure !== undefined) ? 'https' : 'http';

            const gulpOpenOptions = {
                uri: protocol + '://localhost:' + configuration.projectConfig.build.server_port + configuration.projectConfig.build.default_html
            };

            return gulp.src('')
            .pipe(gulpOpen(gulpOpenOptions));
        }
    };

})();
