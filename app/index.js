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
    this.option('sdkVersion', {
      desc: "BookingBug SDK version"
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
        message: 'What is the name of your project? (please use no spaces or illegal characters)',
        validate: function(appName) {
          if (appName.match(/^[a-zA-Z0-9]+$/))
            return true;
          else
            return false;
        }
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

  getVersion: function() {
    if (this.options.sdkVersion) {
      this.version = this.options.sdkVersion;
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

  getArchive: function () {
    this.log('Get archive');
    var that = this;
    var done = this.async();
    var ghclient = github.client();
    var ghrepo = ghclient.repo('BookingBug/bookingbug-angular');
    var tmpPath = path.join(os.tmpdir(), 'bookingbug', this.version);
    this.log(tmpPath);
    mkdirp(tmpPath, function(err) {
      if (err) that.log(err);
      var zipPath = path.join(tmpPath, 'bookingbug-angular.zip');
      that.log(zipPath);
      try {
        that.log('Check for archive');
        fs.lstatSync(zipPath);
        that.log('Found archive');
        done();
      } catch (e) {
        that.log('Archive not found, fetching');
        ghrepo.archive('zipball', that.version, function(err, url, headers) {
          if (err) that.log(err);
          that.log('Archive URL: ' + url);
          request(url)
            .pipe(fs.createWriteStream(zipPath))
            .on('close', function() {
              var zip = new AdmZip(zipPath);
              zip.extractAllTo(tmpPath);
              done();
            });
        });
      }
    });
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
      "company_id": this.companyId,
      "api_url": this.apiUrl,
      "assets_url": ""
    };
    this.fs.writeJSON("config.json", config);
  },

  copySrc: function () {
    var src = path.join(this.sourceRoot(), 'src/**/*');
    var dest = path.join(this.destinationPath(), 'src');
    this.fs.copy(src, dest);
    this.fs.copyTpl(this.templatePath("gulpfile.js"), "gulpfile.js", { type: this.type });
  },

  installTemplates: function () {
    var tmpPath = path.join(os.tmpdir(), 'bookingbug', this.version);
    this.fs.copy(glob.sync(path.join(tmpPath, "/*/src/public-booking/templates/**")), "src/templates");
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
        'gulp-replace',
        'gulp-template',
        'gulp-sass',
        'main-bower-files',
        'gulp-uglify',
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
