path = require('path')
fs = require('fs')
args = require('./args.js')
jsonFile = require('jsonfile')

getConfig = () ->
  env = args.getEnvironment()
  config = null
  configPath = 'config.json'

  try
    config = jsonFile.readFileSync(configPath);
  catch error
    console.log 'No config file specified for project'
    return {}

  configProperty = 'development'

  if env.match /stag/
    configProperty = 'staging'
  else if env.match /prod/
    configProperty = 'production'
  else if env.match /local/
    configProperty = 'local'

  for prop, propValue of config['general']
    config[prop] = propValue

  for prop, propValue of config[configProperty]
    config[prop] = propValue

  delete config['local']
  delete config['development']
  delete config['staging']
  delete config['production']

  return config

module.exports =
  getConfig: getConfig
