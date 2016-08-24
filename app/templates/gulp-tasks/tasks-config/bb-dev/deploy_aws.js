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
            if ((configuration.projectConfig.local_sdk === true) && (['staging', 'prod'].indexOf(configuration.environment) !== -1)) {
                console.log(gulpUtil.colors.white.bgRed.bold('Cannot deploy to staging|prod using local sdk.'));
                process.exit(1);
            }
        }

        function guardEnvironmentalVariables() {
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

        function consoleNotificationAboutDeployment() {
            var msg = "Deploying to " + configuration.environment + " using SDK version " + getSdkVersion();
            gulpUtil.log(gulpUtil.colors.green(msg));
        }

        /**
         * @returns {String|Array.<String>}
         */
        function getReleaseFiles() {
            var releaseFiles = './tmp/**';
            if (argv.media) {
                releaseFiles = ['./tmp/images/**', './tmp/fonts/**'];
            }

            return releaseFiles;
        }

        /**
         * @returns {Object}
         */
        function renameReleaseFiles() {
            return gulpRename(function (path) {
                path.dirname = configuration.projectConfig.deploy_path + path.dirname; //TODO is it correct ???
            })
        }

        /**
         * @returns {Object}
         */
        function publishRelease() {

            var publisher = createAwsPublisher();

            var publishHeaders = {
                'Cache-Control': 'max-age=' + configuration.projectConfig.cache_control_max_age
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
         * @returns {String}
         * @throws {Error}
         */
        function getSdkVersion() {

            var bowerJsonPath = path.join(configuration.projectRootPath, 'bower.json');
            var bowerJson = JSON.parse(fs.readFileSync(bowerJsonPath, 'utf8'));

            for (var depName in bowerJson.dependencies) {
                var depVersion = bowerJson.dependencies[depName];
                if (localSdk.isBBDependency(depName)) {
                    return depVersion;
                }
            }

            throw new Error('No BB dependency found.');
        }

        /**
         * @returns {Object}
         */
        function slackNotificationAboutDeployment() {
            var message = getUserDetails() + " deployed `" + configuration.projectConfig.app_name + "` to " + configuration.environment + " with SDK version " + getSdkVersion();
            return getSlackPostman()(message)
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
