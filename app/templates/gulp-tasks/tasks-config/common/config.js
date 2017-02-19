(function () {
    'use strict';

    const deepRenameKeys = require('deep-rename-keys');
    const gulpNgConstant = require('gulp-ng-constant');
    const gulpRename = require('gulp-rename');
    const path = require('path');
    const projectConfig = require('../helpers/project_config');

    module.exports = function (gulp, configuration) {

        gulp.task('config', configTask);

        function configTask() {

            if(configuration.deploy !== true){
                reloadProjectConfig();
            }

            let projectConfig = JSON.parse(JSON.stringify(configuration.projectConfig));
            projectConfig = deepRenameKeys(projectConfig, upperCaseKey);

            let options = {
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

})();
