(function (angular) {
    'use strict';

    angular.module('<%= module_name %>', [
        'BB',
        'TemplateOverrides',
        '<%= module_name %>.version'
    ]);

})(angular);