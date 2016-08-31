(function () {
    'use strict';

    var _ = require('lodash');
    var AdmZip = require('adm-zip');
    var camelCase = require('camelcase');
    var fs = require('fs');
    var generators = require('yeoman-generator');
    var glob = require('glob');
    var github = require('octonode');
    var mkdirp = require('mkdirp');
    var os = require('os');
    var path = require('path');
    var request = require('request');

    var BookingBugGenerator = generators.Base.extend();

    module.exports = BookingBugGenerator.extend({

        constructor: function () {
            generators.Base.apply(this, arguments);

            this.option('name', {
                desc: "Project name"
            });
            this.option('company-id', {
                desc: "Company ID"
            });
            this.option('api-url', {
                desc: "API URL"
            });
            this.option('skip-npm', {
                desc: "Skip installing npm dependencies"
            });
            this.option('skip-bower', {
                desc: "Skip installing bower dependencies"
            });
            this.option('sdk-version', {
                desc: "BookingBug SDK version"
            });
            this.option('bb-dev', {
                desc: "Use the BookingBug SDK in development mode",
                type: Boolean,
                defaults: false
            });
        },

        _validateNameForBespoke: function (appName, defer) {
            var s3Client = require('s3').createClient({s3Options: {region: 'eu-west-1'}});
            s3Client.s3.listObjects({
                Bucket: 'bespoke.bookingbug.com',
                Prefix: appName + '/'
            }, function (err, data) {
                if (err) defer.resolve(err);
                if (data.Contents.length > 0) {
                    defer.resolve("Already taken on bespoke");
                } else {
                    defer.resolve(true);
                }
            });
        },

        _validateName: function (appName) {
            var defer = require('q').defer();
            if (appName.match(/^[a-zA-Z0-9-]+$/)) {
                if (this.options['bb-dev'] && !this.options['force-name']) {
                    this._validateNameForBespoke(appName, defer);
                } else {
                    defer.resolve(true);
                }
            } else {
                defer.resolve("Alphanumeric characters only");
            }
            return defer.promise;
        },

        getProjectType: function () {

            var _this = this;

            var done = this.async();
            this.prompt({
                type: 'list',
                name: 'type',
                message: 'Please choose the type of your project',
                choices: ['admin', 'public-booking']
            }, function (response) {
                this.type = response.type;

                if (response.type === 'public-booking') {

                    var templatesDirPath = path.join(_this.sourceRoot(), 'public-booking/templates');
                    var templatesFilenames = fs.readdirSync(templatesDirPath);

                    var choices = templatesFilenames.map(function (filename) {
                        return {name: filename, checked: true}
                    });

                    _this.prompt({
                        type: 'checkbox',
                        name: 'type',
                        message: 'Please choose templates',
                        choices: choices
                    }, function (response) {

                        _this.publicBookingTemplates = response.type;

                        done();
                    });
                } else {
                    done();
                }
            }.bind(this));
        },

        getName: function () {
            if (this.options.name) {
                this.appName = this.options.name;
            } else {
                var done = this.async();
                this.prompt({
                    type: 'input',
                    name: 'appName',
                    message: 'What is the name of your project?',
                    validate: this._validateName.bind(this)
                }, function (response) {
                    this.appName = response.appName;
                    done();
                }.bind(this));
            }
        },

        _validateUrl: function (apiUrl) {
            if (apiUrl.match(/http[s]?:\/\//))
                return true;
            else
                return "Invalid protocol. Should be http:// or https://";
        },

        getConfig: function () {
            var prompts = [];
            if (this.type == 'public-booking') {
                if (this.options['company-id']) {
                    this.companyId = this.options['company-id'];
                } else {
                    prompts.push({
                        type: 'input',
                        name: 'companyId',
                        message: 'What is your BookingBug company id?'
                    });
                }
            }
            if (this.options['bb-dev']) {
                if (this.options['development-api-url']) {
                    this.developmentApiUrl = this.options['development-api-url'];
                } else {
                    prompts.push({
                        type: 'input',
                        name: 'developmentApiUrl',
                        message: 'What is the development API URL?',
                        default: 'https://' + this.appName.toLowerCase() + '-dev.bookingbug.com',
                        validate: this._validateUrl
                    });
                }
                if (this.options['staging-api-url']) {
                    this.stagingApiUrl = this.options['staging-api-url'];
                } else {
                    prompts.push({
                        type: 'input',
                        name: 'stagingApiUrl',
                        message: 'What is the staging API URL?',
                        default: 'https://' + this.appName.toLowerCase() + '-staging.bookingbug.com',
                        validate: this._validateUrl
                    });
                }
                if (this.options['production-api-url']) {
                    this.productionApiUrl = this.options['production-api-url'];
                } else {
                    prompts.push({
                        type: 'input',
                        name: 'productionApiUrl',
                        message: 'What is the production API URL?',
                        default: 'https://' + this.appName.toLowerCase() + '.bookingbug.com',
                        validate: this._validateUrl
                    });
                }
            } else {
                if (this.options['api-url']) {
                    this.apiUrl = this.options['api-url'];
                } else {
                    prompts.push({
                        type: 'input',
                        name: 'apiUrl',
                        message: 'What is the API URL?',
                        default: 'https://www.bookingbug.com',
                        validate: this._validateUrl
                    });
                }
            }
            var done = this.async();
            this.prompt(prompts, function (response) {
                if (response.companyId) this.companyId = response.companyId;
                if (response.apiUrl) this.apiUrl = response.apiUrl;
                if (response.developmentApiUrl) this.developmentApiUrl = response.developmentApiUrl;
                if (response.stagingApiUrl) this.stagingApiUrl = response.stagingApiUrl;
                if (response.productionApiUrl) this.productionApiUrl = response.productionApiUrl;
                done();
            }.bind(this));
        },

        getVersion: function () {
            if (this.options['sdk-version']) {
                this.version = this.options['sdk-version'];
                this.log('Latest version is ' + this.version);
            } else {
                var that = this;
                var done = this.async();
                var ghclient = github.client();
                var ghrepo = ghclient.repo('BookingBug/bookingbug-angular');
                ghrepo.releases(function (err, releases, headers) {
                    if (err) that.log(err);
                    that.version = releases[0].tag_name;
                    that.log('Latest version is ' + that.version);
                    done();
                });
            }
        },

        enforceFolderName: function () {
            if (this.appName !== _.last(this.destinationRoot().split(path.sep))) {
                this.destinationRoot(this.appName);
            }

            this.config.save();
        },

        createBower: function () {
            this.fs.copyTpl(
                this.templatePath('bower.json'),
                this.destinationPath('bower.json'),
                {name: this.appName, version: this.version.slice(1), type: this.type}
            );
        },

        createNpm: function () {
            this.fs.copyTpl(
                this.templatePath('package.json'),
                this.destinationPath('package.json'),
                {name: this.appName}
            );
        },

        createConfig: function () {
            var default_html = (this.type == 'public-booking') ? '/new_booking.html' : '/index.html';
            var config = {
                app_name: this.appName,
                api_url: this.apiUrl,
                server_port: 8000,
                default_html: default_html
            };
            if (this.type == 'public-booking') {
                config.company_id = this.companyId;
            }
            if (this.options['bb-dev']) {
                delete config.api_url;
                config = {
                    general: _.extend({
                        cache_control_max_age: '10',
                        local_sdk: false,
                        uglify: true,
                    }, config),
                    local: {},
                    development: {},
                    staging: {},
                    production: {}
                };
                config.local.uglify = false;
                config.local.local_sdk = true;
                config.production.cache_control_max_age = '300';
                config.production.deploy_path = "/" + this.appName + "/";
                config.staging.deploy_path = "/" + this.appName + "/staging/";
                config.development.deploy_path = "/" + this.appName + "/development/";
                config.local.api_url = "http://localhost:3000";
                config.development.api_url = this.developmentApiUrl;
                config.staging.api_url = this.stagingApiUrl;
                config.production.api_url = this.productionApiUrl;
            }
            this.fs.writeJSON("config.json", config);
        },

        copySrc: function () {
            var src = path.join(this.sourceRoot(), this.type, 'src', '**', '*');
            var dest = this.destinationPath('src');

            this.fs.copy(src, dest);

            this.copy("editorconfig", ".editorconfig");
            this.copy("gitignore", ".gitignore");

            this.fs.copy(
                path.join(this.sourceRoot(), 'gulp-tasks', 'helpers', 'common'),
                this.destinationPath(path.join('gulp-tasks', 'helpers'))
            );

            this.fs.copy(
                path.join(this.sourceRoot(), 'gulp-tasks', 'tasks-config', 'common'),
                this.destinationPath(path.join('gulp-tasks', 'tasks-config'))
            );
            this.fs.copy(
                path.join(this.sourceRoot(), 'gulp-tasks', 'tasks-register', 'common'),
                this.destinationPath(path.join('gulp-tasks', 'tasks-register'))
            );

            if (this.options['bb-dev'] === true) {

                this.copy("bowerrc", ".bowerrc");
                this.copy('gulp-tasks/README.bb_dev.md', 'gulp-tasks/README.md');
                this.copy('gulpfile.bb_dev.js', 'gulpfile.js');
                this.copy(path.join('gulp-tasks', 'gulpfile.bb_dev.js'), path.join('gulp-tasks', 'gulpfile.js'));

                this.fs.copy(
                    path.join(this.sourceRoot(), 'gulp-tasks', 'helpers', 'bb-dev'),
                    path.join('gulp-tasks', 'helpers')
                );
                this.fs.copy(
                    path.join(this.sourceRoot(), 'gulp-tasks', 'tasks-register', 'bb-dev'),
                    path.join('gulp-tasks', 'tasks-register')
                );
                this.fs.copy(
                    path.join(this.sourceRoot(), 'gulp-tasks', 'tasks-config', 'bb-dev'),
                    path.join('gulp-tasks', 'tasks-config')
                );
            } else {
                this.copy('gulp-tasks/README.non_bb_dev.md', 'gulp-tasks/README.md');
                this.copy('gulpfile.non_bb_dev.js', 'gulpfile.js');
                this.copy(path.join('gulp-tasks', 'gulpfile.non_bb_dev.js'), path.join('gulp-tasks', 'gulpfile.js'));

                this.fs.copy(
                    path.join(this.sourceRoot(), 'gulp-tasks', 'tasks-config', 'non-bb-dev'),
                    path.join('gulp-tasks', 'tasks-config')
                );
                this.fs.copy(
                    path.join(this.sourceRoot(), 'gulp-tasks', 'tasks-register', 'non-bb-dev'),
                    path.join('gulp-tasks', 'tasks-register')
                );
            }

            this.template(
                path.join(this.type, 'src', 'javascripts', 'main.js.coffee'),
                path.join('src', 'javascripts', 'main.js.coffee'),
                {module_name: camelCase(this.appName)}
            );

            this.template(
                path.join(this.type, 'src', 'stylesheets', 'main.scss'),
                path.join('src', 'stylesheets', 'main.scss'),
                {project_name: this.appName}
            );

            this.copy(
                "theme.scss",
                path.join('src', 'stylesheets', this.appName + '_theme.scss')
            );

            if (this.type === 'admin') {
                this.template(
                    path.join(this.type, 'src', 'www', 'index.html'),
                    path.join('src', 'www', 'index.html'),
                    {module_name: camelCase(this.appName)}
                );
            } else if (this.type == 'public-booking') {
                this.template(
                    path.join(this.type, 'src', 'www', 'new_booking.html'),
                    path.join('src', 'www', 'new_booking.html'),
                    {module_name: camelCase(this.appName)}
                );
                this.template(
                    path.join(this.type, 'src', 'www', 'new_booking_event.html'),
                    path.join('src', 'www', 'new_booking_event.html'),
                    {module_name: camelCase(this.appName)}
                );
                this.template(
                    path.join(this.type, 'src', 'www', 'view_booking.html'),
                    path.join('src', 'www', 'view_booking.html'),
                    {module_name: camelCase(this.appName)}
                );

                for (var filenameKey in this.publicBookingTemplates) {
                    var filename = this.publicBookingTemplates[filenameKey];
                    var from = path.join('public-booking/templates', filename);
                    var to = path.join('src/templates', filename);
                    this.copy(from, to);
                }

            }


        },

        installNpmDependencies: function () {

            var dependencies = [
                'bower',
                'del',
                'gulp',
                'gulp-angular-templatecache',
                'gulp-css-selector-limit',
                'gulp-coffee',
                'gulp-concat',
                'gulp-connect',
                'gulp-flatten',
                'gulp-if',
                'gulp-livereload',
                'gulp-ng-annotate',
                'gulp-open',
                'gulp-plumber',
                'gulp-protractor',
                'gulp-rename',
                'gulp-sass',
                'gulp-sourcemaps',
                'gulp-template',
                'gulp-uglify',
                'gulp-util',
                'gulp-watch',
                'include-all',
                'jasmine-core',
                'jsonfile',
                'main-bower-files',
                'mkdirp',
                'path',
                'phantomjs-prebuilt',
                'run-sequence',
                'sauce-connect-launcher',
                'selenium-server-standalone-jar',
                'yargs'
            ];

            var devDependencies = dependencies.concat([
                'gulp-awspublish',
                'gulp-environments',
                'git-user-email',
                'git-user-name',
                'gulp-slack'
            ]);

            if (!this.options['skip-npm']) {

                this.npmInstall(dependencies, {'save': true, 'cache-min': 3600, 'loglevel': 'info'});

                if (this.options['bb-dev']) {
                    this.npmInstall(devDependencies, {'save': true, 'cache-min': 3600, 'loglevel': 'info'});
                }
            }
        },

        installBowerDependencies: function () {
            if (!this.options['skip-bower']) {
                //this.bowerInstall();
                if (this.type === 'member') {
                    this.bowerInstall([
                        'angular-slick',
                        'angular-recaptcha'
                    ], {
                        "save": true
                    });
                }
            }
        }

    });
})(this);
