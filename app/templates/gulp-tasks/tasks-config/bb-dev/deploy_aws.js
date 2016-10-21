(function () {
    'use strict';

    var argv = require('yargs').argv;
    var fs = require('fs');
    var gitUserEmail = require('git-user-email');
    var gitUserName = require('git-user-name');
    var gulpAwsPublish = require('gulp-awspublish');
    var gulpRename = require('gulp-rename');
    var gulpSlack = require('gulp-slack');
    var gulpUtil = require('gulp-util');
    var localSdk = require('../helpers/local_sdk');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('deploy-aws', deployToAwsTask);

        function deployToAwsTask() {

            guardExternalSdkDependencies();
            guardEnvironmentalVariables();
            consoleNotificationAboutDeployment();

            return gulp.src(getReleaseFiles())
                .pipe(renameReleaseFiles())
                .pipe(gulpAwsPublish.gzip({ext: ''}))
                .pipe(publishRelease())
                .pipe(gulpAwsPublish.reporter())
                .pipe(slackNotificationAboutDeployment());
        }

        function guardExternalSdkDependencies() {
            if ((configuration.projectConfig.build.local_sdk === true) && (['prod'].indexOf(configuration.environment) !== -1)) {
                console.log(gulpUtil.colors.white.bgRed.bold('Cannot deploy to staging|prod using local sdk.'));
                process.exit(1);
            }
        }

        function guardEnvironmentalVariables() {
            if (!process.env.AWS_ACCESS_KEY_ID) {
                throw new Error('Missing environment variable AWS_ACCESS_KEY_ID');
            }
            if (!process.env.AWS_SECRET_ACCESS_KEY) {
                throw new Error('Missing environment variable AWS_SECRET_ACCESS_KEY');
            }
            if (!process.env.BB_SDK_SLACK_URL) {
                throw new Error('Missing environment variable BB_SDK_SLACK_URL');
            }
        }

        function consoleNotificationAboutDeployment() {
            var sdkVersion = configuration.projectConfig.build.sdk_version === null ? 'unreleased version' : 'version ' + configuration.projectConfig.build.sdk_version;
            var projectVersion = configuration.projectConfig.build.deploy_version === false ? 'unreleased version' : 'version ' + configuration.projectConfig.build.deploy_version;
            var msg = "Deploying to " + configuration.environment + " with SDK " + sdkVersion + ", PROJECT " +  projectVersion;
            gulpUtil.log(gulpUtil.colors.green(msg));
        }

        /**
         * @returns {String|Array.<String>}
         */
        function getReleaseFiles() {
            var releaseFiles = './release/**';
            if (argv.media) {
                releaseFiles = ['./release/images/**', './release/fonts/**'];
            }

            return releaseFiles;
        }

        /**
         * @returns {Object}
         */
        function renameReleaseFiles() {
            return gulpRename(function (path) {
                path.dirname = configuration.projectConfig.build.deploy_path + path.dirname;
            });
        }

        /**
         * @returns {Object}
         */
        function publishRelease() {

            var publisher = createAwsPublisher();

            var publishHeaders = {
                'Cache-Control': 'max-age=' + configuration.projectConfig.build.cache_control_max_age
            };
            var publishOptions = {
                force: true
            };

            return publisher.publish(publishHeaders, publishOptions);
        }

        /**
         * @returns {Object}
         */
        function createAwsPublisher() {
            var awsPublishOptions = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                params: {
                    Bucket: 'bespoke.bookingbug.com'
                },
                region: 'eu-west-1'
            };

            return gulpAwsPublish.create(awsPublishOptions);
        }

        /**
         * @returns {Object}
         */
        function slackNotificationAboutDeployment() {
            var sdkVersion = configuration.projectConfig.build.sdk_version === null ? 'unreleased version' : 'version ' + configuration.projectConfig.build.sdk_version;
            var projectVersion = configuration.projectConfig.build.deploy_version === false ? 'unreleased version' : 'version ' + configuration.projectConfig.build.deploy_version;
            var message = getUserDetails() + " deployed `" + configuration.projectConfig.build.app_name + "` to " + configuration.environment + " with SDK " + sdkVersion + ' , PROJECT ' + projectVersion;
            return getSlackPostman()(message);
        }

        /**
         * @returns {String}
         */
        function getUserDetails() {
            var user = gitUserName();
            var mail = gitUserEmail();
            if (typeof user !== "undefined" && user.trim().length > 0) {
                return mail += " | " + user;
            } else {
                return mail;
            }
        }

        /**
         * @returns {Object}
         */
        function getSlackPostman() {
            var slackConfig = {
                url: process.env.BB_SDK_SLACK_URL,
                user: "ROBO",
                icon_emoji: ":cow:"
            };

            return gulpSlack(slackConfig);
        }
    };

})(this);
