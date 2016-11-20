(function () {
    'use strict';

    var fs = require('fs');
    var karma = require('karma');
    var path = require('path');

    module.exports = function (gulp, configuration) {


        var prepareKarmaFiles = function () {
            var bowerFiles, projectFiles;
            bowerFiles = require('main-bower-files')({
                filter: ['**/*.js'],
                paths: {
                    bowerDirectory: 'bower_components',
                    bowerJson: 'bower.json'
                }
            });
            projectFiles = [
                'src/javascripts/**/*.module.js.coffee',
                'src/templates/**/*.html',
                'src/javascripts/**/*.coffee',
                'src/javascripts/**/*.js'
            ];
            return bowerFiles.concat(projectFiles);
        };

        /*
         * @param {Boolean} isDev
         */
        var getKarmaServerSettings = function (isDev) {
            var serverSettings;
            serverSettings = {
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

}).call(this);
