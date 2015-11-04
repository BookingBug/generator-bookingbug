'use strict'

var generators = require('yeoman-generator');
var _ = require('lodash');
var path = require('path');

module.exports = generators.Base.extend({

  constructor: function () {
    generators.Base.apply(this, arguments);

    this.option('skip-npm', {
      desc: "Skip installing npm dependencies"
    });
    this.option('skip-bower', {
      desc: "Skip installing bower dependencies"
    });
  },

  getName: function () {
    var done = this.async();
    this.prompt({
      type: 'input',
      name: 'appName',
      message: 'What is the name of your project?'
    }, function (response) {
      this.appName = response.appName;
      done();
    }.bind(this));
  },

   getProjectType: function() {
    var done = this.async();
    this.prompt({
      type: 'list',
      name: 'appType',
      message: 'What type of application do you want?',
      choices: [{
      name: 'Public-bookings application',
      value: 'bookingbug-angular-public-booking'
    }, {
      name: 'Member application',
      value: 'bookingbug-angular-member'
    }] }, function(response){
      this.appType = response.appType;
      done();
    }.bind(this));
  },

  getConfig: function () {
    var done = this.async();
    var prompts = [{
      type: 'input',
      name: 'companyId',
      message: 'What is your BookingBug company id?',
    }, {
      type: 'input',
      name: 'apiUrl',
      message: 'What is the API URL?',
      default: 'https://www.bookingbug.com',
      validate: function(apiUrl) {
        if(apiUrl.substring(0, 8) !== 'https://' && apiUrl.substring(0, 7) !== 'http://')
          return false;
        else
          return true;
      }
    }];
    this.prompt(prompts, function (response) {
      this.companyId = response.companyId;
      this.apiUrl = response.apiUrl;
      done();
    }.bind(this));
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
      { name: this.appName }
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
      "company_id": this.companyId,
      "api_url": this.apiUrl
    };
    this.fs.writeJSON("config.json", config);
    this.fs.writeJSON("config.staging.json", config);
    this.fs.writeJSON("config.dev.json", config);
  },

  copySrc: function () {
    this.fs.copy(this.templatePath("src/" + this.appType), "src");
    this.fs.copyTpl(this.templatePath("gulpfile.js"), "gulpfile.js", { appType: this.appType });
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
        'yargs',
        'gulp-replace',
        'gulp-template',
        'gulp-sass',
        'main-bower-files',
        'gulp-uglify',
        'gulp-bower',
        'path'
      ], { 'save': true, 'cache-min': 3600, 'loglevel': 'info' })
    };
  },

  installBowerDependencies: function () {
    if (!this.options['skip-bower']) {
      this.bowerInstall(['bookingbug-angular-public-booking', 'bookingbug-angular-member'], {
        "save": true
      });
      if(this.appType === 'bookingbug-angular-member') {
        this.bowerInstall(['angular-slick', 'angular-recaptcha'], {
          "save": true
        });
      }
    };
  }

});
