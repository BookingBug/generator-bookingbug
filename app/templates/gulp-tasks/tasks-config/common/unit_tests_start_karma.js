(function () {
    'use strict';

    const fs = require('fs');
    const karma = require('karma');
    const path = require('path');

    module.exports = function (gulp, configuration) {

        const prepareKarmaFiles = function () {
            let bowerFiles = require('main-bower-files')({
                filter: ['**/*.js'],
                paths: {
                    bowerDirectory: 'bower_components',
                    bowerJson: 'bower.json'
                }
            });
            let projectFiles = [
                'tmp/config.constants.js',
                'release/booking-widget-templates.js',
                'src/javascripts/**/*.module.js',
                'src/templates/**/*.html',
                'src/javascripts/**/*.js'
            ];
            return bowerFiles.concat(projectFiles);
        };

        /*
         * @param {Boolean} isDev
         */
        const getKarmaServerSettings = function (isDev) {
            const serverSettings = {
                configFile: path.join(__dirname, '/../karma.conf.js'),
                basePath: '../',
                files: prepareKarmaFiles(),
                autoWatch: true,
                singleRun: false
            };
            if (!isDev) {
                serverSettings.autoWatch = false;
                serverSettings.singleRun = true;
            }
            return serverSettings;
        };

        gulp.task('unit-tests-start-karma:watch', function (cb) {
            return new karma.Server(getKarmaServerSettings(true), cb).start();
        });

        gulp.task('unit-tests-start-karma', function (cb) {
            return new karma.Server(getKarmaServerSettings(false), cb).start();
        });
    };

})();
