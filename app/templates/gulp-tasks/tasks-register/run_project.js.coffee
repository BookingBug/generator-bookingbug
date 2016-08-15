module.exports = (gulp, plugins, path)->
  gulpConnect = require('gulp-connect')
  args = require('../helpers/args.js')

  gulp.task 'run-project', (cb) ->
    plugins.sequence(
      'build-project'
      'webserver'
      cb
    )
    return

  gulp.task 'run-project:watch', (cb) ->
    plugins.sequence(
      'build-project:watch'
      'webserver'
      cb
    )
    return

  return
