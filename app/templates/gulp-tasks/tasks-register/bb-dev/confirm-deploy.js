(function () {
    'use strict';

    const readline = require('readline').createInterface({input: process.stdin, output: process.stdout});

    module.exports = function (gulp, configuration) {

        gulp.task('confirm-deploy', confirmDeploy)

        function confirmDeploy(cb) {
            if(configuration.environment.startsWith('dev')) {
                cb();
            } else {
                let sdkVersion = configuration.projectConfig.build.sdk_version === null ? 'local SDK' : 'SDK v' + configuration.projectConfig.build.sdk_version;
                let projectVersion = configuration.projectConfig.build.deploy_version === false ? 'current directory' : 'project v' + configuration.projectConfig.build.deploy_version;
                let question = `Deploy ${projectVersion} to ${configuration.environment} using ${sdkVersion} (yes/no)`;
                readline.question(question, function (answer) {
                    answer = answer.toLowerCase();
                    if(answer === 'y' || answer === 'yes')
                        cb();
                    else
                        process.exit()
                });
            }
        }
    };
})();
