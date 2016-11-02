'use strict'

angular.module('<%= module_name %>.version').run (bbConfig, $window) ->
  'ngInject'

  init = () ->
    exposeVersions()
    return

  exposeVersions = () ->
    sdk_version = bbConfig.BUILD.SDK_VERSION
    if sdk_version is null
      sdk_version = 'unreleased version'

    project_deploy_version = bbConfig.BUILD.DEPLOY_VERSION
    if project_deploy_version is false
      project_deploy_version = 'unreleased version'

    $window.BB =
      SDK_VERSION: sdk_version
      PROJECT_DEPLOY_VERSION: project_deploy_version

    return

  init()

  return
