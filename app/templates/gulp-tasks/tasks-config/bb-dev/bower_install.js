(function () {
    'use strict';

    var bower = require('bower');
    var bowerCli = require('../../node_modules/bower/lib/util/cli');
    var fs = require('fs');
    var jsonFile = require('jsonfile');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('bower-install', bowerInstallTask);

        function bowerInstallTask(cb) {

            var renderer = bowerCli.getRenderer('install', null, bower.config);
            var overrideOriginalResolutions = false;

            bower.commands
                .install([], {save: true}, {interactive: true})
                .on('end', function (data) {
                    renderer.end(data);

                    if (overrideOriginalResolutions) {
                        updateOriginalBowerResolutions();
                    }

                    cb();
                })
                .on('error', function (err) {
                    renderer.error(err);
                    process.exit(1);
                })
                .on('log', function (log) {
                    renderer.log(log);
                })
                .on('prompt', function (prompt, callback) {
                    renderer.prompt(prompt)
                        .then(function (answer) {
                            overrideOriginalResolutions = true;
                            callback(answer);
                        });
                });
        }

        function updateOriginalBowerResolutions() {
            var bowerOriginalPath = path.join(configuration.projectRootPath, 'bower.json');
            var bowerTmpPath = path.join(configuration.projectTmpPath, 'bower.json');

            var bowerTmpJson = JSON.parse(fs.readFileSync(bowerTmpPath, 'utf8'));

            if (typeof bowerTmpJson.resolutions === 'undefined') {
                return
            }

            var bowerOriginalJson = JSON.parse(fs.readFileSync(bowerOriginalPath, 'utf8'));

            bowerOriginalJson.resolutions = bowerTmpJson.resolutions;

            jsonFile.writeFileSync(bowerOriginalPath, bowerOriginalJson, {spaces: 2});
        }
    };

}).call(this);
