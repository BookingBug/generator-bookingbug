module.exports = (gulp, plugins, path)->
  args = require('../helpers/args.js')
  gulpAngularTemplateCache = require('gulp-angular-templatecache')
  gulpConcat = require('gulp-concat')
  gulpFlatten = require('gulp-flatten')
  gulpUglify = require('gulp-uglify')
  gulpTemplate = require('gulp-template')
  projectConfig = require('../helpers/project_config.js')

  gulp.task 'build-project-templates', () ->
    templatesSrcGlob = path.join plugins.config.projectRootPath, 'src/templates/*.html'
    templatesDest = path.join plugins.config.projectRootPath, 'dist'

    stream = gulp.src(templatesSrcGlob)
    .pipe(gulpAngularTemplateCache('client_templates.js', {module: 'BB'}))
    .pipe(gulpFlatten())
    .pipe(gulpTemplate(projectConfig.getConfig()))
    .pipe(gulp.dest(templatesDest))

    if args.getEnvironment() isnt 'dev'
      stream.pipe(gulpUglify({mangle: false}))
      .pipe(gulpConcat('client_templates.min.js'))
      .pipe(gulp.dest(path.join(plugins.config.projectRootPath, 'dist')));

    return stream


  gulp.task 'build-project-templates:watch', (cb) ->
    templatesSrcGlob = path.join plugins.config.projectRootPath, 'src/templates/*.html'
    gulp.watch(templatesSrcGlob, ['build-project-templates'])

    gulp.watch(['src/admin/templates/**/*'], ['build-sdk:admin:templates'])
    gulp.watch(['src/admin-booking/templates/**/*'], ['build-sdk:admin-booking:templates'])
    gulp.watch(['src/admin-dashboard/templates/**/*'], ['build-sdk:admin-dashboard/:templates'])
    gulp.watch(['src/core/templates/**/*'], ['build-sdk:core:templates'])
    gulp.watch(['src/events/templates/**/*'], ['build-sdk:events:templates'])
    gulp.watch(['src/member/templates/**/*'], ['build-sdk:member:templates'])
    gulp.watch(['src/public-booking/templates/**/*'], ['build-sdk:public-booking:templates'])
    gulp.watch(['src/services/templates/**/*'], ['build-sdk:services:templates'])
    gulp.watch(['src/settings/templates/**/*'], ['build-sdk:settings:templates'])

    gulp.watch([path.join plugins.config.projectRootPath, 'bower_components/bookingbug-angular-*/*templates.js'], ['build-project-scripts:sdk-only-templates'])


    cb()
    return

  return
