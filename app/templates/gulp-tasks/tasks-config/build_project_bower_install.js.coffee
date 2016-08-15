module.exports = (gulp, plugins, path)->
  args = require('../helpers/args.js')
  del = require 'del'
  gulpBower = require('gulp-bower')
  gulpShell = require('gulp-shell')
  mkdirp = require('mkdirp')

  ###
  * @param {String} sdkDependency
  ###
  generateSymlinkCommand = (sdkDependency) ->
    sdkDependencyBuildPath = path.join plugins.config.sdkRootPath, 'build', sdkDependency
    sdkDependencyProjectPath = path.join plugins.config.projectRootPath, '/gulp-tasks/bower_components/bookingbug-angular-' + sdkDependency
    linkCommand = "ln -s '" + sdkDependencyBuildPath + "' '" + sdkDependencyProjectPath + "'"
    return linkCommand

  gulp.task 'build-project-bower-install', () ->

    mkdirp.sync(path.join plugins.config.projectRootPath, 'gulp-tasks/bower_components');

    delPathGlob = path.join plugins.config.projectRootPath, 'gulp-tasks/bower_components/bookingbug-angular-*'
    del.sync([delPathGlob])

    gulp.src('').pipe gulpShell [
      generateSymlinkCommand('admin')
      generateSymlinkCommand('admin-booking')
      generateSymlinkCommand('admin-dashboard')
      generateSymlinkCommand('core')
      generateSymlinkCommand('events')
      generateSymlinkCommand('member')
      generateSymlinkCommand('public-booking')
      generateSymlinkCommand('services')
      generateSymlinkCommand('settings')
    ], {
      ignoreErrors: true
    }

    return gulpBower({cwd: plugins.config.projectRootPath + '/gulp-tasks', directory: './bower_components'})

  return
