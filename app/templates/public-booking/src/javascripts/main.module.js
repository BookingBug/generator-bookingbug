(function (angular) {
    'use strict';
    angular.module('<%= module_name %>', [
        'BB',
        'TemplateOverrides',
        <% for (let i = 0; i < modules.length; i++) {%>
        '<%= modules[i] %>',
        <% } %>
        '<%= module_name %>.version'
    ]);

})(angular);
