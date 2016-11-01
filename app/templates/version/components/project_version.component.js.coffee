'use strict'

angular.module('<%= module_name %>.version').directive 'bbProjectVersion',
  controller: 'BbProjectVersionController'
  controllerAs: 'vm_project_version'
  templateUrl: 'bespoke/version/project_version.html'