(function () {
    'use strict';

    const bower = require('bower');
    const bowerCli = require('../../node_modules/bower/lib/util/cli');
    const fs = require('fs');
    const jsonFile = require('jsonfile');
    const path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('bower-install', bowerInstallTask);

        function bowerInstallTask(cb) {

            let renderer = bowerCli.getRenderer('install', null, bower.config);
            let overrideOriginalResolutions = false;

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
            let bowerOriginalPath = path.join(configuration.projectRootPath, 'bower.json');
            let bowerTmpPath = path.join(configuration.projectTmpPath, 'bower.json');

            let bowerTmpJson = JSON.parse(fs.readFileSync(bowerTmpPath, 'utf8'));

            if (typeof bowerTmpJson.resolutions === 'undefined') {
                return
            }

            let bowerOriginalJson = JSON.parse(fs.readFileSync(bowerOriginalPath, 'utf8'));

            bowerOriginalJson.resolutions = bowerTmpJson.resolutions;

            jsonFile.writeFileSync(bowerOriginalPath, bowerOriginalJson, {spaces: 2});
        }
    };

})();
