(function () {
    'use strict';

    var deepRenameKeys = require('deep-rename-keys');
    var gulpNgConstant = require('gulp-ng-constant');
    var gulpRename = require('gulp-rename');
    var path = require('path');
    var projectConfig = require('../helpers/project_config');

    module.exports = function (gulp, configuration) {

        gulp.task('config', configTask);

        function configTask() {

            if(configuration.deploy !== true){
                reloadProjectConfig();
            }

            var projectConfig = JSON.parse(JSON.stringify(configuration.projectConfig));
            projectConfig = deepRenameKeys(projectConfig, upperCaseKey);

            var options = {
                constants: {
                    bbConfig: projectConfig
                },
                deps: false,
                merge: true,
                name: "BB",
                space: '    ',
                stream: true,
                wrap: false
            };

            return gulpNgConstant(options)
                .pipe(gulpRename('config.constants.js'))
                .pipe(gulp.dest(configuration.projectTmpPath));
        }

        function reloadProjectConfig(){
            configuration.projectConfig = projectConfig.getConfig();
        }

        /**
         * @param {String} key
         * @returns {String}
         */
        function upperCaseKey(key) {
            return key.toUpperCase();
        }
    };

}).call(this);
