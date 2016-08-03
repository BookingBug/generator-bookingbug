'use strict';

var generators = require('yeoman-generator');
var _ = require('lodash');
var path = require('path');
var github = require('octonode');
var fs = require('fs');
var os = require('os');
var AdmZip = require('adm-zip');
var request = require('request');
var mkdirp = require('mkdirp');
var glob = require('glob');

var BookingBugGenerator = generators.Base.extend();

module.exports = BookingBugGenerator.extend({

  constructor: function () {
    generators.Base.apply(this, arguments);

    this.argument('type', {
      type: String,
      required: false,
      defaults: 'public-booking'
    });

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

  getName: function () {
    if (this.options.name) {
      this.appName = this.options.name;
    } else {
      var done = this.async();
      this.prompt({
        type: 'input',
        name: 'appName',
        message: 'What is the name of your project?',
        validate: function(appName) {
          if (appName.match(/^[a-zA-Z0-9]+$/))
            return true;
          else
            return "Alphanumeric characters only";
        }
      }, function (response) {
        this.appName = response.appName;
        done();
      }.bind(this));
    }
  },

  _validateUrl: function(apiUrl) {
    if (apiUrl.match(/http[s]?:\/\//))
      return true;
    else
      return "Invalid protocol. Should be http:// or https://";
  },

  getConfig: function () {
    var prompts = [];
    if (this.options['company-id']) {
      this.companyId = this.options['company-id'];
    } else {
      prompts.push({
        type: 'input',
        name: 'companyId',
        message: 'What is your BookingBug company id?',
      });
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
    this.prompt(prompts, function(response) {
      if (response.companyId) this.companyId = response.companyId;
      if (response.apiUrl) this.apiUrl = response.apiUrl;
      if (response.developmentApiUrl) this.developmentApiUrl = response.developmentApiUrl;
      if (response.stagingApiUrl) this.stagingApiUrl = response.stagingApiUrl;
      if (response.productionApiUrl) this.productionApiUrl = response.productionApiUrl;
      done();
    }.bind(this));
  },

  getVersion: function() {
    if (this.options['sdk-version']) {
      this.version = this.options['sdk-version'];
      this.log('Latest version is ' + this.version);
    } else {
      var that = this;
      var done = this.async();
      var ghclient = github.client();
      var ghrepo = ghclient.repo('BookingBug/bookingbug-angular');
      ghrepo.releases(function(err, releases, headers) {
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
      this.templatePath('_bower.json'),
      this.destinationPath('bower.json'),
      { name: this.appName, version: this.version.slice(1) }
    );
  },

  createNpm: function () {
    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      { name: this.appName }
    );
  },

  createConfig: function () {
    var config = {
      app_name: this.appName,
      company_id: this.companyId,
      api_url: this.apiUrl,
      assets_url: "",
      server_port: 8000
    };
    if (this.options['bb-dev']) {
      config = {
        local: _.extend({}, config),
        development: _.extend({}, config),
        staging: _.extend({}, config),
        production: _.extend({}, config)
      };
      config.local.api_url = "http://localhost:3000";
      config.local.bower_link = true;
      config.production.bower_link = false;
      config.staging.bower_link = false;
      config.development.bower_link = false;
      config.production.cache_control_max_age = '300';
      config.staging.cache_control_max_age = '10';
      config.development.cache_control_max_age = '10';
      config.production.deploy_path = "/" + this.appName + "/";
      config.staging.deploy_path = "/" + this.appName + "/staging/";
      config.development.deploy_path = "/" + this.appName + "/development/";
      config.development.api_url = this.developmentApiUrl;
      config.staging.api_url = this.stagingApiUrl;
      config.production.api_url = this.productionApiUrl;
    }
    this.fs.writeJSON("config.json", config);
  },

  copySrc: function () {
    var src = path.join(this.sourceRoot(), 'src/**/*');
    var dest = this.destinationPath('src');
    this.fs.copy(src, dest);
    this.fs.copyTpl(
      this.templatePath("gulpfile.js"),
      "gulpfile.js",
      { bb_dev: this.options['bb-dev'] }
    );
    this.fs.copyTpl(
      this.templatePath("src/stylesheets/main.scss"),
      this.destinationPath("src/stylesheets/main.scss"),
      { project_name: this.appName }
    );
    this.template("_theme.scss", "src/stylesheets/" + this.appName + "_theme.scss");
  },

  installNpmDependencies: function () {
    if (!this.options['skip-npm']) {
      this.npmInstall([
        'gulp',
        'gulp-coffee',
        'gulp-concat',
        'gulp-if',
        'gulp-util',
        'del',
        'gulp-connect',
        'gulp-angular-templatecache',
        'gulp-rename',
        'gulp-flatten',
        'promptly',
        'gulp-replace',
        'gulp-template',
        'gulp-sass',
        'main-bower-files',
        'gulp-uglify',
        'path',
        'gulp-sourcemaps',
        'gulp-plumber',
        'gulp-css-selector-limit',
        'connect-modrewrite',
        'gulp-open'
      ], { 'save': true, 'cache-min': 3600, 'loglevel': 'info' });
      if (this.options['bb-dev']) {
        this.npmInstall([
          'gulp-awspublish',
          'gulp-environments',
          'git-user-name',
          'git-user-email',
          'gulp-slack',
          'yargs',
          'lodash',
          'glob',
          'rimraf',
          'gulp-bower',
          'gulp-bower-link',
          'through2',
          'walk',
          'bower'
        ], { 'save': true, 'cache-min': 3600, 'loglevel': 'info' });
      }
    }
  },

  installBowerDependencies: function () {
    if (!this.options['skip-bower']) {
      this.bowerInstall();
      if(this.type === 'member') {
        this.bowerInstall(['angular-slick', 'angular-recaptcha'], {
          "save": true
        });
      }
    }
  }

});
