module.exports = (gulp, plugins, path)->
  args = require('../helpers/args.js')
  gulpCoffee = require('gulp-coffee')
  gulpConcat = require('gulp-concat')
  gulpIf = require('gulp-if');
  gulpUglify = require('gulp-uglify')
  gulpUtil = require('gulp-util')
  mainBowerFiles = require('main-bower-files')

  projectFiles = [
    path.join(plugins.config.projectRootPath, 'src/javascripts/**/*.js')
    path.join(plugins.config.projectRootPath, 'src/javascripts/**/*.js.coffee')
    path.join('!**/*.spec.js')
    path.join('!**/*.spec.js.coffee')
    path.join('!**/*.js.js')
    path.join('!**/*.js.map')
  ]

  ###
  * @param {Array.<String>} files
  * @param {String} filename
  ###
  buildScriptsStream = (files, filename) ->
    stream = gulp.src(files)
    .pipe(gulpIf(/.*js.coffee$/, gulpCoffee().on('error', gulpUtil.log)))
    .pipe(gulpConcat(filename + '.js'))
    .pipe(gulp.dest(path.join(plugins.config.projectRootPath, 'dist')));

    if args.getEnvironment() isnt 'dev'
      stream.pipe(gulpUglify({mangle: false}))
      .pipe(gulpConcat(filename + '.min.js'))
      .pipe(gulp.dest(path.join(plugins.config.projectRootPath, 'dist')));

    return stream

  ###
  * @param {Function} filter
  * @param {String} filename
  * @returns {Object}
  ###
  buildVendorScripts = (filter, filename) ->
    dependenciesFiles = mainBowerFiles(
      paths:
        bowerDirectory: path.join plugins.config.projectRootPath, 'gulp-tasks/bower_components'
        bowerrc: path.join plugins.config.projectRootPath, 'gulp-tasks/.bowerrc'
        bowerJson: path.join plugins.config.projectRootPath, 'gulp-tasks/bower.json'
      filter: filter
    )

    return buildScriptsStream dependenciesFiles, filename

  ###
  * @param {String} filename
  * @returns {Object}
  ###
  buildProjectScripts = (filename) ->
    return buildScriptsStream projectFiles, filename

  ###
  * @param {String} path
  * @returns {Boolean}
  ###
  nonBbDependenciesFilter = (path) ->
    return ( path.match(new RegExp('.js$')) ) and ( path.indexOf('bookingbug-angular-') is -1 )

  ###
  * @param {String} path
  * @returns {Boolean}
  ###
  bbDependenciesNoTemplatesFilter = (path) ->
    isBookingBugDependency = path.indexOf('bookingbug-angular-') isnt -1
    return isBookingBugDependency and path.match(new RegExp('.js$')) and !path.match(new RegExp('-templates.js$'))

  ###
  * @param {String} path
  * @returns {Boolean}
  ###
  bbDependenciesOnlyTemplatesFilter = (path) ->
    isBookingBugDependency = path.indexOf('bookingbug-angular-') isnt -1
    return isBookingBugDependency and path.match(new RegExp('-templates.js$'))

  gulp.task 'build-project-scripts:vendors', () ->
    return buildVendorScripts nonBbDependenciesFilter, 'vendors'

  gulp.task 'build-project-scripts:sdk-no-templates', () ->
    return buildVendorScripts bbDependenciesNoTemplatesFilter, 'sdk'

  gulp.task 'build-project-scripts:sdk-only-templates', () ->
    return buildVendorScripts bbDependenciesOnlyTemplatesFilter, 'sdk_templates'

  gulp.task 'build-project-scripts:client', () ->
    return buildProjectScripts 'client'

  gulp.task 'build-project-scripts:watch', (cb) ->
    gulp.watch(projectFiles, ['build-project-scripts:client'])

    gulp.watch(['src/admin/javascripts/**/*'], ['build-sdk:admin:javascripts'])
    gulp.watch(['src/admin-booking/javascripts/**/*'], ['build-sdk:admin-booking:javascripts'])
    gulp.watch(['src/admin-dashboard/javascripts/**/*'], ['build-sdk:admin-dashboard:javascripts'])
    gulp.watch(['src/core/javascripts/**/*'], ['build-sdk:core:javascripts'])
    gulp.watch(['src/events/javascripts/**/*'], ['build-sdk:events:javascripts'])
    gulp.watch(['src/member/javascripts/**/*'], ['build-sdk:member:javascripts'])
    gulp.watch(['src/public-booking/javascripts/**/*'], ['build-sdk:public-booking:javascripts'])
    gulp.watch(['src/services/javascripts/**/*'], ['build-sdk:services:javascripts'])
    gulp.watch(['src/settings/javascripts/**/*'], ['build-sdk:settings:javascripts'])

    gulp.watch([
      path.join plugins.config.projectRootPath, 'bower_components/bookingbug-angular-*/*.js'
      '!' + path.join plugins.config.projectRootPath, 'bower_components/bookingbug-angular-*/*-templates.js'
    ], ['build-project-scripts:sdk-no-templates'])

    cb()
    return

  return
