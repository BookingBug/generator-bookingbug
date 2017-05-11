(function () {
    'use strict';

    var inquirer = require('inquirer');

    module.exports = function (gulp, configuration) {

        gulp.task('confirm-deploy', confirmDeploy);

        function confirmDeploy(cb) {

            let sdkVersion = configuration.projectConfig.build.sdk_version === null ? 'local SDK' : 'SDK v' + configuration.projectConfig.build.sdk_version;
            let projectVersion = configuration.projectConfig.build.deploy_version === false ? 'current directory' : 'project v' + configuration.projectConfig.build.deploy_version;
            let questions = [
                {
                    type: 'confirm',
                    name: 'confirmDeploy',
                    message: `Deploy ${projectVersion} to ${configuration.environment} using ${sdkVersion}?`,
                    default: false
                }
            ];
            inquirer.prompt(questions).then(function (answers){
                if (answers['confirmDeploy']){
                    cb();
                } else {
                    process.exit();
                }
            });
        }
    };
})();
