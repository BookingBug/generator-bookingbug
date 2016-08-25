(function () {
    'use strict';

    var args = require('./helpers/args.js');
    var includeAll = require("include-all");
    var path = require("path");
    var projectConfig = require('./helpers/project_config.js');

    module.exports = function (gulp, projectRootPath) {

        var configuration = null;

        init();

        function init() {
            loadConfiguration();
            loadTasks('tasks-config');
            loadTasks('tasks-register');
        }

        function loadConfiguration() {
            configuration = {
                environment: args.getEnvironment(),
                projectConfig: projectConfig.getConfig(),
                projectRootPath: projectRootPath,
                projectReleasePath: path.join(projectRootPath, 'release')
            };
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
