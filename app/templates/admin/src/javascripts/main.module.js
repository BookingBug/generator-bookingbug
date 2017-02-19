(function (angular) {
    'use strict';

    angular.module('<%= module_name %>', [
        'BBAdminDashboard',
        'TemplateOverrides',
        '<%= module_name %>.version'
    ]);

})(angular);
