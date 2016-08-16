(function () {
    'use strict';

    module.exports = function (gulp, plugins, path) {

        gulp.task('deploy', deployTask);

        var argv = require('yargs').argv;
        var gulpAwsPublish = require('gulp-awspublish');
        var gitUserName = require('git-user-name');
        var gitUserEmail = require('git-user-email');
        var gulpUtil = require('gulp-util');
        var gulpRename = require('gulp-rename');
        var gulpSlack = require('gulp-slack');

        function deployTask() {

            var config = plugins.config.projectConfig;

            guardEnvironmentVariables();

            var publisher = gulpAwsPublish.create({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                params: {
                    Bucket: 'bespoke.bookingbug.com'
                },
                region: 'eu-west-1'
            });

            var msg = "Deploying to " + plugins.config.environment + " using SDK version " + getVersion();
            gulpUtil.log(gulpUtil.colors.green(msg));

            var headers = {
                'Cache-Control': 'max-age=' + config.cache_control_max_age
            };

            var releaseFiles = './release/**';

            if (argv.media) {
                releaseFiles = ['./release/images/**', './release/fonts/**'];
            }

            var slackConfig = {
                url: process.env.BB_SDK_SLACK_URL,
                user: "ROBO",
                icon_emoji: ":cow:"
            };

            var slack = gulpSlack(slackConfig);

            return gulp.src(releaseFiles)
                .pipe(gulpRename(function (path) {
                    path.dirname = config.deploy_path + path.dirname;
                }))
                .pipe(gulpAwsPublish.gzip({ext: ''}))
                .pipe(publisher.publish(headers, {force: true}))
                .pipe(gulpAwsPublish.reporter())
                .pipe(slack(getUserDetails() + " deployed `" + config.app_name + "` to " + plugins.config.environment + " with SDK version " + getVersion()));
        }

        function guardEnvironmentVariables(){
            if (!process.env.AWS_ACCESS_KEY_SID) {
                throw new Error('Missing environment variable AWS_ACCESS_KEY_ID');
            }
            if (!process.env.AWS_SECRET_ACCESS_KEY) {
                throw new Error('Missing environment variable AWS_SECRET_ACCESS_KEY');
            }
            if (!process.env.BB_SDK_SLACK_URL) {
                throw new Error('Missing environment variable BB_SDK_SLACK_URL');
            }
        }

        function getVersion() {
            return 'TODO';
            /*delete require.cache[require.resolve('./bower.json')];
             var bower = require('./bower.json');
             return _.find(bower.dependencies, function(v, k) {
             return k.match(/bookingbug-angular-/);
             });*/
        }

        function getUserDetails() {
            var user = gitUserName();
            var mail = gitUserEmail();
            if (user && user !== undefined) {
                return mail += " | " + user;
            } else {
                return mail;
            }
        }

    };

})(this);