argv = require('yargs').argv
path = require('path')
fs = require('fs')

###
* @returns {String} ['local'|'dev'|'staging'|'prod']
###
getEnvironment = () ->
  environment = 'dev'
  environmentOptions = ['local', 'dev', 'staging', 'prod']
  if typeof argv.env isnt 'undefined'
    if environmentOptions.indexOf(argv.env) is -1
      console.log 'env can has one of following values: ' + environmentOptions
      process.exit 1
    environment = argv.env
  return environment

module.exports =
  getEnvironment: getEnvironment
