module.exports = (gulp, plugins, path)->
  args = require('../helpers/args.js')
  del = require 'del'
  gulpBower = require('gulp-bower')
  gulpShell = require('gulp-shell')
  mkdirp = require('mkdirp')
  fs = require('fs')
  jsonFile = require('jsonfile')


  ###
  * @param {String} dependencyName
  * @returns {Boolean}
  ###
  isBBDependency = (dependencyName) ->
    return new RegExp(/^bookingbug-angular.*/).test dependencyName

  ###
  *@param {String} dependencyName
  ###
  generatePathToSdkBuild = (dependencyName) ->
    return path.join plugins.config.sdkRootPath, 'build', dependencyName.replace('bookingbug-angular-',''), '/'

  gulp.task 'build-project-bower-prepare', (cb) ->

    bowerOriginalJsonPath = path.join plugins.config.projectRootPath, 'bower.json'
    bowerGulpJsonPath = path.join plugins.config.projectRootPath, 'gulp-tasks/bower.json'
    bowerJson = JSON.parse(fs.readFileSync(bowerOriginalJsonPath, 'utf8'))

    for depName,depVersion of bowerJson.dependencies
      if isBBDependency depName
        bowerJson.dependencies[depName] = generatePathToSdkBuild(depName)

    bowerJson.resolutions['bookingbug-angular-admin'] = "*";
    bowerJson.resolutions['bookingbug-angular-admin-booking'] = "*";
    bowerJson.resolutions['bookingbug-angular-admin-dashboard'] = "*";
    bowerJson.resolutions['bookingbug-angular-core'] = "*";
    bowerJson.resolutions['bookingbug-angular-events'] = "*";
    bowerJson.resolutions['bookingbug-angular-member'] = "*";
    bowerJson.resolutions['bookingbug-angular-public-booking'] = "*";
    bowerJson.resolutions['bookingbug-angular-services'] = "*";
    bowerJson.resolutions['bookingbug-angular-settings'] = "*";

    jsonFile.writeFile bowerGulpJsonPath, bowerJson, (err) ->
      console.log err if err isnt null

    cb()
    return



  return
