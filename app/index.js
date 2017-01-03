(function () {
    'use strict';

    var _ = require('lodash');
    var camelCase = require('camelcase');
    var fs = require('fs');
    var generators = require('yeoman-generator');
    var glob = require('glob');
    var github = require('octonode');
    var gulpUtil = require('gulp-util');
    var mkdirp = require('mkdirp');
    var os = require('os');
    var path = require('path');
    var request = require('request');
    var updater = require('./updater.js');

    var BookingBugGenerator = generators.Base.extend();

    var projectTypes = [
        'admin',
        'public-booking'
    ];

    var publicBookingOptions = [
        {
            name: 'Appointment Booking',
            abbr: 'abook',
            template: 'main_appointment.html',
            www: 'new_booking.html',
            checked: true
        },
        {
            name: 'Member Account (Authenticated)',
            abbr: 'member',
            template: 'main_account.html',
            www: 'account.html',
            checked: true
        },
        {
            name: 'Event Booking',
            abbr: 'ebook',
            template: 'main_event.html',
            www: 'new_booking_event.html',
            checked: true
        },
        {
            name: 'Purchase Certificate Journey',
            abbr: 'cert',
            template: 'main_gift_certificate.html',
            www: 'gift_certificate.html',
            checked: true
        },
        {
            name: 'View Booking (Not Authenticated)',
            abbr: 'vbook',
            template: 'main_view_booking.html',
            www: 'view_booking.html',
            checked: true
        }
    ];

    function errorLogFormat(msg) {
        return gulpUtil.colors.white.bgRed.bold("*** " + msg + " ***");
    }

    /**
     * @param {Function} done
     */
    function promptBookingBugOptions(done) {
        var _this = this;

        this.prompt({
            type: 'checkbox',
            name: 'type',
            message: 'Please choose types of user journeys you want to create',
            choices: publicBookingOptions
        }, function (response) {

            if (response.type.length === 0) {

                publicBookingOptions.map(function (option) {
                    option.checked = false;
                });

                _this.log(gulpUtil.colors.red.bold('Please select at least one type of journey'));

                promptBookingBugOptions.bind(_this)(done);
            } else {

                _this.publicBookingOptionsSelected = response.type;

                done();
            }
        });
    }

    module.exports = BookingBugGenerator.extend({

        constructor: function () {
            generators.Base.apply(this, arguments);
            var _this = this;

            this.option('name', {
                desc: "Project name"
            });
            this.option('type', {
                desc: "Project type [admin|public-booking]"
            });
            this.option('options', {
                desc: "Public Booking Options: Appointment Booking (abook), Event Booking (ebook), View Booking (vbook), Purchase Certificate Journey (cert), Member Account (member)"
            })
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
            this.option('google-maps-key', {
                desc: "Google Maps Key (leave blank if you don't have one)"
            });
            this.option('skip-prompts', {
                desc: 'Skip all prompts',
                type: Boolean,
                defaults: false
            });
        },

        checkGeneratorVersion: function () {
            updater.checkGeneratorVersion.call(this);
        },

        _validateNameForBespoke: function (appName, defer) {
            var _this = this;
            var s3Client = require('s3').createClient({s3Options: {region: 'eu-west-1'}});
            s3Client.s3.listObjects({
                Bucket: 'bespoke.bookingbug.com',
                Prefix: appName + '/'
            }, function (err, data) {

                if (err !== null) {
                    _this.log(errorLogFormat('\nmake sure you have working internet connection'));
                    _this.log(errorLogFormat(err));
                    process.exit(1);
                    defer.resolve(err);
                }

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

        _validateCompanyId: function (companyId) {
            if(companyId.toString().match(/^\d+$/)) {
                return true;
            }else {
                return "Numbers only";
            }
        },

        getProjectType: function () {
            var _this = this;

            var done = this.async();

            if(typeof this.options['type'] !== 'undefined' && projectTypes.indexOf(this.options['type']) === -1){
                _this.log(errorLogFormat('possible project types'), projectTypes);
                process.exit(1);
            }


            if(projectTypes.indexOf(this.options['type']) !== -1){

                this.type = this.options['type'];

                if(this.type === 'public-booking' && _this._getPublicBookingOptions().length < 1) {
                    promptBookingBugOptions.bind(_this)(done);
                }else{
                    done();
                }

                return;
            }

            this.prompt({
                type: 'list',
                name: 'type',
                message: 'Please choose the type of your project',
                choices: projectTypes
            }, function (response) {
                this.type = response.type;

                if (response.type === 'public-booking') {

                    promptBookingBugOptions.bind(_this)(done);

                } else {
                    done();
                }
            }.bind(this));
        },

        getName: function () {
            if (this.options['name'] && typeof this.options['name'] === 'string') {
                this.appName = this.options['name'];
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

        _getPublicBookingOptions: function () {
            var _this = this;
            var options = [];

            if (this.options['options'] && this.options['options'].length > 0) {

                options = this.options['options'].split(',');

                publicBookingOptions.map(function(option){

                    var index = options.findIndex(function(opt){
                        return opt === option.abbr;
                    });

                    if(index !== -1) {
                        options[index] = option.name;
                    }

                     _this.publicBookingOptionsSelected = options;
                });
            }

            return options;
        },

         _getOptionDefaults: function () {
            var _this = this;
            if (!_this.optionDefaults) {
                _this.optionDefaults = {
                    'company-id': 37000,
                    'api-url': 'https://www.bookingbug.com',
                    'development-api-url': 'https://' + _this.appName.toLowerCase() + '-dev.bookingbug.com',
                    'staging-api-url': 'https://' + _this.appName.toLowerCase() + '-staging.bookingbug.com',
                    'production-api-url': 'https://' + _this.appName.toLowerCase() + '.bookingbug.com',
                    'google-maps-key': ""
               }
            }
            return _this.optionDefaults;
        },

        initOptionDefaults: function () {
            this.companyId = this._getOptionDefaults()['company-id'];
            this.apiUrl = this._getOptionDefaults()['api-url'];
            this.developmentApiUrl = this._getOptionDefaults()['development-api-url'];
            this.stagingApiUrl = this._getOptionDefaults()['staging-api-url'];
            this.produictionApiUrl = this._getOptionDefaults()['production-api-url'];
            this.googleMapsKey = this._getOptionDefaults()['google-maps-key'];
        },

        _validateUrl: function (apiUrl) {
            if (apiUrl.match(/http[s]?:\/\//))
                return true;
            else
                return "Invalid protocol. Should be http:// or https://";
        },

        _validateFlag: function (flag, validateFn) {
            var result = validateFn(this.options[flag]);
            if (result !== true) {
                this.log(errorLogFormat(flag + " [ERROR]"));
                this.log(errorLogFormat(result));
                process.exit();
            }
        },

        _validateNonBooleanFlag: function (flag) {
            if (typeof this.options[flag] === 'boolean') {
                this.log(errorLogFormat("--" + flag + " cannot be blank"));
                process.exit();
            }
        },

        getConfig: function () {
            var prompts = [];
            if (this.type == 'public-booking') {
                if (this.options['company-id']) {
                    this._validateNonBooleanFlag('company-id');
                    this.companyId = this.options['company-id'];
                    this._validateFlag('company-id', this._validateCompanyId);
                } else if (!this.options['skip-prompts']){
                    prompts.push({
                        type: 'input',
                        name: 'companyId',
                        message: 'What is your BookingBug company id?',
                        default: this._getOptionDefaults()['company-id'],
                        validate: this._validateCompanyId
                    });
                }
            }
            if (this.options['bb-dev']) {
                if (this.options['development-api-url']) {
                    this._validateNonBooleanFlag('development-api-url');
                    this.developmentApiUrl = this.options['development-api-url'];
                    this._validateFlag('development-api-url', this._validateUrl);
                } else if (!this.options['skip-prompts']){
                    prompts.push({
                        type: 'input',
                        name: 'developmentApiUrl',
                        message: 'What is the development API URL?',
                        default: this._getOptionDefaults()['development-api-url'],
                        validate: this._validateUrl
                    });
                }
                if (this.options['staging-api-url']) {
                    this._validateNonBooleanFlag('staging-api-url');
                    this.stagingApiUrl = this.options['staging-api-url'];
                    this._validateFlag('staging-api-url', this._validateUrl);
                } else if (!this.options['skip-prompts']){
                    prompts.push({
                        type: 'input',
                        name: 'stagingApiUrl',
                        message: 'What is the staging API URL?',
                        default: this._getOptionDefaults()['staging-api-url'],
                        validate: this._validateUrl
                    });
                }
                if (this.options['production-api-url']) {
                    this._validateNonBooleanFlag('production-api-url');
                    this.productionApiUrl = this.options['production-api-url'];
                    this._validateFlag('production-api-url', this._validateUrl);
                } else if (!this.options['skip-prompts']){
                    prompts.push({
                        type: 'input',
                        name: 'productionApiUrl',
                        message: 'What is the production API URL?',
                        default: this._getOptionDefaults()['production-api-url'],
                        validate: this._validateUrl
                    });
                }
            } else {
                if (this.options['api-url']) {
                    this._validateNonBooleanFlag('api-url');
                    this.apiUrl = this.options['api-url'];
                    this._validateFlag('api-url', this._validateUrl);
                } else if (!this.options['skip-prompts']){
                    prompts.push({
                        type: 'input',
                        name: 'apiUrl',
                        message: 'What is the API URL?',
                        default: 'https://www.bookingbug.com',
                        validate: this._validateUrl
                    });
                }
            }
            if (this.options['google-maps-key']) {
                this._validateNonBooleanFlag('google-maps-key');
                this.googleMapsKey = this.options['google-maps-key'];
            } else if (!this.options['skip-prompts']){
                prompts.push({
                    type: 'input',
                    name: 'googleMapsKey',
                    message: 'If you have a Google Maps Key please enter it here, otherwise leave blank',
                    default: "optional"
                });
            }
            var done = this.async();
            this.prompt(prompts, function (response) {
                if (response.companyId) this.companyId = response.companyId;
                if (response.apiUrl) this.apiUrl = response.apiUrl;
                if (response.developmentApiUrl) this.developmentApiUrl = response.developmentApiUrl;
                if (response.stagingApiUrl) this.stagingApiUrl = response.stagingApiUrl;
                if (response.productionApiUrl) this.productionApiUrl = response.productionApiUrl;
                if (response.googleMapsKey) this.googleMapsKey = response.googleMapsKey === "optional"? this._getOptionDefaults()['google-maps-key'] : response.googleMapsKey
                done();
            }.bind(this));
        },

        getVersion: function () {
            if (this.options['sdk-version']) {
                this.version = this.options['sdk-version'];
                this.log('Latest version is ' + this.version);
            } else {
                var _this = this;
                var done = this.async();
                var ghclient = github.client();
                var ghrepo = ghclient.repo('BookingBug/bookingbug-angular');
                ghrepo.releases(function (err, releases, headers) {

                    if (err !== null) {
                        _this.log(errorLogFormat('make sure you have working internet connection'));
                        _this.log(errorLogFormat(err));
                        process.exit(1);
                    }

                    releases.sort(sortBookingBugReleases);

                    _this.version = releases[0].tag_name;
                    _this.log('Latest version is ' + _this.version);
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

        createBuildConfig: function () {

            var _this = this;
            var defaultHtml = '/index.html';

            var config = {
                general: {
                    build: {
                        app_name: this.appName,
                        default_html: defaultHtml,
                        server_port: 8000
                    },
                    core: {
                        google_maps_key: this.googleMapsKey
                    }
                }
            };

            if (this.options['bb-dev']) {

                config.general.build.cache_control_max_age = '10';
                config.general.build.deploy_version = "v0.0.1";
                config.general.build.local_sdk = false;
                config.general.build.show_version = false;
                config.general.build.uglify = true;

                config.local = {
                    build: {
                        uglify: false,
                        local_sdk: true

                    },
                    core: {
                        api_url: "http://localhost:3000"
                    }
                };
                config.development = {
                    build: {
                        deploy_path: "/" + this.appName + "/development/",
                        deploy_version: false
                    },
                    core: {
                        api_url: this.developmentApiUrl
                    }
                };
                config.staging = {
                    build: {
                        deploy_path: "/" + this.appName + "/staging/",
                        show_version: true
                    },
                    core: {
                        api_url: this.stagingApiUrl
                    }
                };
                config.production = {
                    build: {
                        cache_control_max_age: '300',
                        deploy_path: "/" + this.appName + "/"
                    },
                    core: {
                        api_url: this.productionApiUrl
                    }
                };
            } else {
                config.general.core.api_url = this.apiUrl
            }

            if (this.type == 'public-booking') {

                config.general.build.default_html = '/' + publicBookingOptions.filter(function (option) {
                        return option.name === _this.publicBookingOptionsSelected[0];
                    })[0].www;

                config.general.core.company_id = this.companyId;
            }

            this.fs.writeJSON("config.json", config);
        },

        copySrc: function () {

            this.log(typeof path.join, this.sourceRoot(),  this.type);

            var src = path.join(this.sourceRoot(), this.type, 'src', '**', '*');
            var dest = this.destinationPath('src');

            this.fs.copy(src, dest);

            this.copy("editorconfig", ".editorconfig");
            this.copy("gitignore", ".gitignore");
            this.copy('gulp-tasks/karma.conf.js', 'gulp-tasks/karma.conf.js');

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

            var templateOptions = {module_name: camelCase(this.appName)};

            this.template(
                path.join(this.type, 'src', 'javascripts'),
                path.join('src', 'javascripts'),
                templateOptions
            );

            this.template(
                path.join('version'),
                path.join('src', 'javascripts', 'version'),
                templateOptions
            );

            this.copy(
                "_client_theme.scss",
                path.join('src', 'stylesheets', '_client_theme.scss')
            );

            this.copy("config_readme.md", path.join('src', 'config', 'config_readme.md'));

            if (this.type === 'admin') {
                this.template(
                    path.join(this.type, 'src', 'www', 'index.html'),
                    path.join('src', 'www', 'index.html'),
                    templateOptions
                );
            } else if (this.type == 'public-booking') {

                for (var optionKey in this.publicBookingOptionsSelected) {

                    var optionName = this.publicBookingOptionsSelected[optionKey];
                    var option = publicBookingOptions.filter(function (option) {
                        return option.name === optionName;
                    })[0];

                    var templateFrom = path.join('public-booking/templates', option.template);
                    var templateTo = path.join('src/templates', option.template);

                    this.log('templateFrom', templateFrom, 'templateTo', templateTo);
                    this.template(templateFrom, templateTo, templateOptions);

                    var wwwFrom = path.join('public-booking/www', option.www);
                    var wwwTo = path.join('src/www', option.www);

                    this.log('wwwFrom', wwwFrom, 'wwwTo', wwwTo);
                    this.template(wwwFrom, wwwTo, templateOptions);
                }
            }
        },

        installNpmDependencies: function () {

            if (this.options['skip-npm']) {
                return;
            }

            var dependencies = [
                'bower@^1.8.0',
                'del@^2.2.2',
                'deep-rename-keys@^0.2.0',
                'deepmerge@^1.3.1',
                'fs-finder@^1.8.1',
                'gulp@^3.9.1',
                'gulp-angular-templatecache@^2.0.0',
                'gulp-css-selector-limit@^0.1.2',
                'gulp-coffee@^2.3.3',
                'gulp-concat@^2.6.1',
                'gulp-connect@^5.0.0',
                'gulp-flatten@^0.3.1',
                'gulp-if@^2.0.2',
                'gulp-livereload@^3.8.1',
                'gulp-ng-annotate@^2.0.0',
                'gulp-ng-constant@^1.1.0',
                'gulp-open@^2.0.0',
                'gulp-plumber@^1.1.0',
                'gulp-rename@^1.2.2',
                'gulp-sass@^2.3.2',
                'gulp-sourcemaps@^1.9.1',
                'gulp-template@^4.0.0',
                'gulp-uglify@^2.0.0',
                'gulp-util@^3.0.7',
                'gulp-watch@^4.3.11',
                'karma@^1.3.0',
                'karma-bower@^1.0.1',
                'karma-chrome-launcher@^2.0.0',
                'karma-coffee-coverage@^1.1.2',
                'karma-coffee-preprocessor@^1.0.1',
                'karma-coverage@^1.1.1',
                'karma-firefox-launcher@^1.0.0',
                'karma-html2js-preprocessor@^1.1.0',
                'karma-jasmine@^1.1.0',
                'karma-junit-reporter@^1.2.0',
                'karma-ng-html2js-preprocessor@^1.0.0',
                'karma-phantomjs-launcher@^1.0.2',
                'include-all@^2.0.0',
                'jasmine-core@^2.5.2',
                'jsonfile@^2.4.0',
                'main-bower-files@^2.13.1',
                'mkdirp@^0.5.1',
                'path@^0.12.7',
                'phantomjs-prebuilt@^2.1.14',
                'run-sequence@^1.2.2',
                'yargs@^6.5.0'
            ];

            if (this.options['bb-dev'] === true) {

                dependencies = dependencies.concat([
                    'gulp-awspublish@^3.3.0',
                    'gulp-awspublish-router@^0.1.2',
                    'git-user-email@0.2.1',
                    'git-user-name@^1.2.0',
                    'gulp-slack@^0.1.2',
                    'gulp-git@^1.12.0',
                    'gulp-bump@^2.5.1',
                    'gulp-filter@^4.0.0',
                    'gulp-tag-version@^1.3.0'
                ]);
            }

            this.npmInstall(dependencies, {'save': true, 'cache-min': 3600, 'loglevel': 'info'});
        }
    });

    /**
     * @param {Object} a
     * @param {Object} b
     * @returns {Number} [-1, 0, 1]
     */
    function sortBookingBugReleases(a, b) {
        var aTagName = a.tag_name.replace('v', '').split('.');
        var bTagName = b.tag_name.replace('v', '').split('.');

        var aMajor = parseInt(aTagName[0]),
            aMinor = parseInt(aTagName[1]),
            aPatch = isNaN(aTagName[2]) ? aTagName[2] : parseInt(aTagName[2]),
            bMajor = parseInt(bTagName[0]),
            bMinor = parseInt(bTagName[1]),
            bPatch = isNaN(bTagName[2]) ? bTagName[2] : parseInt(bTagName[2]);

        if (isNaN(aPatch) && isNaN(bPatch)) {// alpha, beta, ...
            return 0;
        }
        if (isNaN(aPatch)) {// alpha, beta, ...
            return 1;
        }
        if (isNaN(bPatch)) { // alpha, beta, ...
            return -1;
        }

        if (aMajor < bMajor) {
            return 1;
        } else if (aMajor > bMajor) {
            return -1;
        } else {
            if (aMinor < bMinor) {
                return 1;
            } else if (aMinor > bMinor) {
                return -1
            } else {
                if (aPatch < bPatch) {
                    return 1;
                } else if (aPatch > bPatch) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    }
})(this);
