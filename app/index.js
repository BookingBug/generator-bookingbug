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
    this.option('companyId', {
      desc: "Company ID"
    });
    this.option('apiUrl', {
      desc: "API URL"
    });
    this.option('skipNpm', {
      desc: "Skip installing npm dependencies"
    });
    this.option('skipBower', {
      desc: "Skip installing bower dependencies"
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
        message: 'What is the name of your project?'
      }, function (response) {
        this.appName = response.appName;
        done();
      }.bind(this));
    }
  },

  getConfig: function () {
    if (this.options.companyId && this.options.apiUrl) {
      this.companyId = this.options.companyId;
      this.apiUrl = this.options.apiUrl;
    } else {
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
    this.fs.copyTpl(this.templatePath("gulpfile.js"), "gulpfile.js", { type: this.type });
  },

  getArchive: function () {
    var version = 'v0.1.0-4';
    var tmpPath = os.tmpdir() + '/bookingbug/' + version;
    mkdirp(tmpPath, function(err) {
      var zipPath = tmpPath + '/bookingbug-angular.zip';
      var ghclient = github.client();
      var ghrepo = ghclient.repo('BookingBug/bookingbug-angular');
      try {
        fs.lstatSync(zipPath);
      } catch (e) {
        ghrepo.archive('zipball', version, function(err, url, headers) {
          request(url)
            .pipe(fs.createWriteStream(zipPath))
            .on('close', function() {
              var zip = new AdmZip(zipPath);
              zip.extractAllTo(tmpPath);
            });
        });
      }
    });
  },

  installStylesheets: function () {
    var version = 'v0.1.0-4';
    var tmpPath = os.tmpdir() + '/bookingbug/' + version;
    this.fs.copy(glob.sync(tmpPath + "/*/src/public-booking/stylesheets/**"), "src/stylesheets");
  },

  installTemplates: function () {
    var version = 'v0.1.0-4';
    var tmpPath = os.tmpdir() + '/bookingbug/' + version;
    this.fs.copy(glob.sync(tmpPath + "/*/src/public-booking/templates/**"), "src/templates");
  },

  installNpmDependencies: function () {
    if (!this.options.skipNpm) {
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
      ], { 'save': true, 'cache-min': 3600, 'loglevel': 'info' });
    }
  },

  installBowerDependencies: function () {
    if (!this.options.skipBower) {
      this.bowerInstall();
      if(this.type === 'member') {
        this.bowerInstall(['angular-slick', 'angular-recaptcha'], {
          "save": true
        });
      }
    }
  }

});
