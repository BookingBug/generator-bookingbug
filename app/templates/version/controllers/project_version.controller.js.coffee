'use strict'

angular.module('<%= module_name %>.version').controller 'BbProjectVersionController', (bbConfig) ->
  'ngInject'

  ### jshint validthis: true ###
  vm = @

  init = () ->
    exposeVersions()
    return

  exposeVersions = () ->
    vm.sdk_version = bbConfig.BUILD.SDK_VERSION
    if vm.sdk_version is null
      vm.sdk_version = 'unreleased version'

    vm.project_deploy_version = bbConfig.BUILD.DEPLOY_VERSION
    if vm.project_deploy_version is false
      vm.project_deploy_version = 'unreleased version'
    vm.show_version = bbConfig.BUILD.SHOW_VERSION
    return

  init();

  return