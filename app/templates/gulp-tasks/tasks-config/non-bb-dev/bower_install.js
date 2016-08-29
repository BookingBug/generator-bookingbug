(function () {
    'use strict';

    var bower = require('bower');
    var bowerCli = require('../../node_modules/bower/lib/util/cli');

    module.exports = function (gulp, configuration) {

        gulp.task('bower-install', bowerInstallTask);

        function bowerInstallTask(cb) {

            var renderer = bowerCli.getRenderer('install', null, bower.config);

            bower.commands
                .install([], {save: true}, {interactive: true})
                .on('end', function (data) {
                    renderer.end(data);
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
                            callback(answer);
                        });
                });
        }
    };

}).call(this);
