(function () {
    'use strict';

    const args = require('./helpers/args.js');
    const includeAll = require("include-all");
    const path = require("path");
    const projectConfig = require('./helpers/project_config.js');

    module.exports = function (gulp, projectRootPath, sdkRootPath) {

        let configuration = null;

        init();

        function init() {
            loadConfiguration();
            loadTasks('tasks-config');
            loadTasks('tasks-register');
        }

        function loadConfiguration() {
            configuration = {
                bbDependencies: [
                    'admin',
                    'admin-booking',
                    'admin-dashboard',
                    'core',
                    'events',
                    'member',
                    'public-booking',
                    'services',
                    'settings'
                ],
                environment: args.getEnvironment(),
                projectConfig: projectConfig.getConfig(),
                projectRootPath: projectRootPath,
                projectReleasePath: path.join(projectRootPath, 'release'),
                projectTmpPath: path.join(projectRootPath, 'tmp'),
                sdkRootPath: sdkRootPath
            };
        }

        function loadTasks(directory) {
            let tasks = includeAll({
                    dirname: path.resolve(__dirname, directory),
                    filter: /(.+)\.(js|coffee)$/
                }) || {};

            for (let taskName in tasks) {
                if (tasks.hasOwnProperty(taskName)) {
                    tasks[taskName](gulp, configuration);
                }
            }
        }

        return module.exports = gulp;
    };

})();
