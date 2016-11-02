(function () {
    'use strict';

    var bump = require('gulp-bump');
    var git = require('gulp-git');
    var filter = require('gulp-filter');
    var fs = require('fs');
    var jsonFile = require('jsonfile');
    var path = require('path');
    var tagVersion = require('gulp-tag-version');


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
                    git.push('origin', 'master', {args: ' --tags'});
                    updateConfigDeployVersion();
                });
        }

        function updateConfigDeployVersion(){
            var bowerConfigPath = path.join(configuration.projectRootPath, 'bower.json');
            var projectConfigPath = path.join(configuration.projectRootPath, 'config.json');
            var bowerConfig = JSON.parse(fs.readFileSync(bowerConfigPath, 'utf8'));
            var projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));

            projectConfig.general.build.deploy_version = 'v' + bowerConfig.version;
            jsonFile.writeFileSync(projectConfigPath, projectConfig, {spaces: 2});

            return this;
        }

    };

}).call(this);
