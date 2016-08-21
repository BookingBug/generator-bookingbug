(function () {
    'use strict';

    var args = require('./helpers/args.js');
    var includeAll = require("include-all");
    var path = require("path");
    var projectConfig = require('./helpers/project_config.js');

    module.exports = function (gulp, projectRootPath, sdkRootPath) {

        var configuration = null;

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
                projectBuildPath: path.join(projectRootPath, 'build'),
                projectConfig: projectConfig.getConfig(),
                projectRootPath: projectRootPath,
                projectReleasePath: path.join(projectRootPath, 'release'),
                projectTmpPath: path.join(projectRootPath, 'tmp'),
                sdkRootPath: sdkRootPath
            }
        }

        function loadTasks(directory) {
            var tasks = includeAll({
                    dirname: path.resolve(__dirname, directory),
                    filter: /(.+)\.(js|coffee)$/
                }) || {};

            for (var taskName in tasks) {
                if (tasks.hasOwnProperty(taskName)) {
                    tasks[taskName](gulp, configuration);
                }
            }
        }

        return module.exports = gulp;
    };

}).call(this);
