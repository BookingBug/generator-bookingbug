module.exports = (gulp, plugins, path)->
  gulpConnect = require('gulp-connect')
  args = require('../helpers/args.js')

  gulp.task 'webserver', () ->
    return gulpConnect.server {
      root: [
        path.join plugins.config.projectRootPath, 'dist'
      ]
      port: 8000
      livereload: true
    }

  return

