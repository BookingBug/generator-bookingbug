module.exports = (gulp, plugins, path)->
  args = require '../helpers/args.js'
  del = require 'del'

  gulp.task 'build-project-clean', (cb) ->
    distPath = path.join plugins.config.projectRootPath, 'dist'
    del.sync([distPath])
    cb()
    return

  return
