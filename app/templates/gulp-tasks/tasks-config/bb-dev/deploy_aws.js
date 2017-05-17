(function () {
    'use strict';

    const argv = require('yargs').argv;
    const args = require('../helpers/args');
    const fs = require('fs');
    const gitRevSync = require('git-rev-sync');
    const gitUserEmail = require('git-user-email');
    const gitUserName = require('git-user-name');
    const gulpAwsPublish = require('gulp-awspublish');
    const gulpRename = require('gulp-rename');
    const gulpSlack = require('gulp-slack');
    const gulpUtil = require('gulp-util');
    const localSdk = require('../helpers/local_sdk');
    const path = require('path');

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
            let sdkVersion = configuration.projectConfig.build.sdk_version === null ? 'unreleased version' : 'version ' + configuration.projectConfig.build.sdk_version;
            let projectVersion = configuration.projectConfig.build.deploy_version === false ? 'unreleased version' : 'version ' + configuration.projectConfig.build.deploy_version;
            let msg = "Deploying to " + configuration.environment + " with SDK " + sdkVersion + ", PROJECT " +  projectVersion;
            gulpUtil.log(gulpUtil.colors.green(msg));
        }

        /**
         * @returns {String|Array.<String>}
         */
        function getReleaseFiles() {
            let releaseFiles = './release/**';
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
                if (args.getEnvironment() === 'prod') {
                    path.dirname = configuration.projectConfig.build.deploy_path + path.dirname;
                } else {
                    let currentBranch = gitRevSync.branch();
                    let currentTag = gitRevSync.tag();
                    let currentBanchOrTag = '';
                    if (currentBranch.match(/detached/i)) {
                        currentBanchOrTag = currentTag;
                    } else currentBanchOrTag = currentBranch;
                    path.dirname = configuration.projectConfig.build.deploy_path + currentBanchOrTag + '/' + path.dirname;
                }
            });
        }

        /**
         * @returns {Object}
         */
        function publishRelease() {

            let publisher = createAwsPublisher();

            let publishHeaders = {
                'Cache-Control': 'max-age=' + configuration.projectConfig.build.cache_control_max_age
            };
            let publishOptions = {
                force: true
            };

            return publisher.publish(publishHeaders, publishOptions);
        }

        /**
         * @returns {Object}
         */
        function createAwsPublisher() {
            let awsPublishOptions = {
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
            let sdkVersion = configuration.projectConfig.build.sdk_version === null ? 'unreleased version' : 'version ' + configuration.projectConfig.build.sdk_version;
            let projectVersion = configuration.projectConfig.build.deploy_version === false ? 'unreleased version' : 'version ' + configuration.projectConfig.build.deploy_version;
            let message = getUserDetails() + " deployed `" + configuration.projectConfig.build.app_name + "` to " + configuration.environment + " with SDK " + sdkVersion + ' , PROJECT ' + projectVersion;
            return getSlackPostman()(message);
        }

        /**
         * @returns {String}
         */
        function getUserDetails() {
            let user = gitUserName();
            let mail = gitUserEmail();
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
            let slackConfig = {
                url: process.env.BB_SDK_SLACK_URL,
                user: "ROBO",
                icon_emoji: ":cow:"
            };

            return gulpSlack(slackConfig);
        }
    };

})(this);
