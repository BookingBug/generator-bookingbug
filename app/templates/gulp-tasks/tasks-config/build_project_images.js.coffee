module.exports = (gulp, plugins, path)->
  args = require('../helpers/args.js')
  gulpFlatten = require('gulp-flatten')

  gulp.task 'build-project-images', () ->
    src = path.join plugins.config.projectRootPath, 'src/images/*.*'
    dist = path.join plugins.config.projectRootPath, 'dist/images'

    return gulp.src(src)
    .pipe(gulpFlatten())
    .pipe(gulp.dest(dist))

  gulp.task 'build-project-images:watch', (cb) ->
    imagesSrcGlob = path.join plugins.config.projectRootPath, 'src/images/*.*'
    gulp.watch(imagesSrcGlob, ['build-project-images'])

    gulp.watch(['src/admin/images/**/*'], ['build-sdk:admin:images'])

    gulp.watch(['src/admin-dashboard/images/**/*'], ['build-sdk:admin-dashboard:images'])
    gulp.watch(['src/public-booking/images/**/*'], ['build-sdk:public-booking:images'])

    ###
    gulp.watch([
      path.join args.getTestProjectRootPath(), 'bower_components/bookingbug-angular-* /**'
      '!' + path.join args.getTestProjectRootPath(), 'bower_components/bookingbug-angular-* /** /*.{eot,svg,ttf,woff,woff2,otf}'
      '!' + path.join args.getTestProjectRootPath(), 'bower_components/bookingbug-angular-* /** /*.js'
      '!' + path.join args.getTestProjectRootPath(), 'bower_components/bookingbug-angular-* /** /*.scss'
    ], [''])
    ###

    cb()
    return

  return
