'use strict'

angular.module('<%= module_name %>.version').directive 'bbProjectVersion', () ->
  'ngInject'

  return {
    controller: 'BbProjectVersionController'
    controllerAs: 'vm_project_version'
    restrict: 'A'
    templateUrl: 'bespoke/version/project_version.html'
  }