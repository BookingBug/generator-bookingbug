(function (angular) {
    'use strict';

    angular.module('<%= module_name %>.version').component('bbProjectVersion', {
        controller: 'BbProjectVersionController',
        controllerAs: '$projectVersionCtrl',
        templateUrl: 'bespoke/version/project_version.html'
    });

})(angular);
