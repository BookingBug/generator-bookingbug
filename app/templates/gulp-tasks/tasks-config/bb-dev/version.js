(function () {
    'use strict';

    const bump = require('gulp-bump');
    const git = require('gulp-git');
    const filter = require('gulp-filter');
    const fs = require('fs');
    const jsonFile = require('jsonfile');
    const path = require('path');
    const tagVersion = require('gulp-tag-version');


    module.exports = function (gulp, configuration) {

        gulp.task('patch', function () {
            bumpTask('patch');
        });
        gulp.task('minor', function () {
            bumpTask('minor');
        });
        gulp.task('major', function () {
            bumpTask('major');
        });
        gulp.task('prerelease', function () {
            bumpTask('prerelease');
        });

        function bumpTask(type) {
            return gulp.src(['./package.json', './bower.json'])
                .pipe(bump({type: type}))
                .pipe(gulp.dest('./'))
                .pipe(git.commit('Bump version'))
                .pipe(filter('package.json'))
                .pipe(tagVersion())
                .on('end', function () {
                    updateConfigDeployVersion();
                    gulp.src(['./config.json'])
                      .pipe(git.commit('Update deploy version'))
                      .on('end', function() {
                        git.push('origin', 'master', {args: ' --follow-tags'});
                      });
                });
        }

        function updateConfigDeployVersion(){
            let bowerConfigPath = path.join(configuration.projectRootPath, 'bower.json');
            let projectConfigPath = path.join(configuration.projectRootPath, 'config.json');
            let bowerConfig = JSON.parse(fs.readFileSync(bowerConfigPath, 'utf8'));
            let projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));

            projectConfig.general.build.deploy_version = 'v' + bowerConfig.version;
            jsonFile.writeFileSync(projectConfigPath, projectConfig, {spaces: 2});

            return this;
        }

    };

})();
