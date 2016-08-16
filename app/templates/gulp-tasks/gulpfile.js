(function () {
    'use strict';

    module.exports = function (gulp, projectRootPath, sdkRootPath) {

        var projectConfig = require('./helpers/project_config.js');
        var args = require('./helpers/args.js');
        var color = require("colors");
        var gulpLoadPlugins = require("gulp-load-plugins");
        var includeAll = require("include-all");
        var path = require("path");
        var plugins = null;

        var configuration = {
            environment: args.getEnvironment(),
            projectBuildPath: path.join(projectRootPath, 'build'),
            projectConfig: projectConfig.getConfig(),
            projectRootPath: projectRootPath,
            projectTmpPath: path.join(projectRootPath, 'tmp'),
            sdkRootPath: sdkRootPath
        };

        init();

        function init() {
            loadPlugins();
            loadTasks('tasks-config');
            loadTasks('tasks-register');
        }

        function loadPlugins() {
            plugins = gulpLoadPlugins({
                pattern: ["gulp-*", "merge-*", "run-*", "main*", "karma*"],
                replaceString: /\bgulp[\-.]|run[\-.]|merge[\-.]|main[\-.]/,
                camelizePluginName: true,
                lazy: true
            });
            plugins.colors = color;
            plugins.config = configuration;
        }

        function loadTasks(directory) {
            var tasks = includeAll({
                    dirname: path.resolve(__dirname, directory),
                    filter: /(.+)\.(js|coffee)$/
                }) || {};

            for (var taskName in tasks) {
                plugins.error = function (error) {
                    return plugins.util.log(error.toString());
                };
                if (tasks.hasOwnProperty(taskName)) {
                    tasks[taskName](gulp, plugins, path);
                }
            }
        }

        return module.exports = gulp;
    };

}).call(this);
