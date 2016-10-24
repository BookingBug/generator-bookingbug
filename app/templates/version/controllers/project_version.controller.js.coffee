'use strict'

angular.module('<%= module_name %>.version').controller 'BbProjectVersionController', (bbConfig) ->
  'ngInject'

  ### jshint validthis: true ###
  vm = @
  vm.sdk_version = bbConfig.BUILD.SDK_VERSION is null ? 'unreleased version' : bbConfig.BUILD.SDK_VERSION
  vm.project_deploy_version = bbConfig.BUILD.DEPLOY_VERSION
  vm.show_version = bbConfig.BUILD.SHOW_VERSION

  return