(function (angular) {
    'use strict';

    angular.module('<%= module_name %>').config(moduleConfig);

    function moduleConfig(AdminCheckInOptionsProvider,
                          AdminClientsOptionsProvider,
                          AdminConfigIframeOptionsProvider,
                          AdminCoreOptionsProvider,
                          AdminDashboardIframeOptionsProvider,
                          AdminLoginOptionsProvider,
                          AdminMembersIframeOptionsProvider,
                          AdminPublishIframeOptionsProvider,
                          AdminSettingsIframeOptionsProvider,
                          BBAnalyticsPiwikProvider,
                          bbConfig) {
        'ngInject';

        // enable Piwik Analytics
        if (bbConfig.CORE.ANALYTICS.ENABLE_PIWIK) BBAnalyticsPiwikProvider.enable();

        // AdminCheckInOptionsProvider.setOption('use_default_states', false);
        // AdminCheckInOptionsProvider.setOption('show_in_navigation', false);

        // AdminClientsOptionsProvider.setOption('use_default_states', false);
        // AdminClientsOptionsProvider.setOption('show_in_navigation', false);

        // AdminConfigIframeOptionsProvider.setOption('use_default_states', false);
        // AdminConfigIframeOptionsProvider.setOption('show_in_navigation', false);

        // AdminCoreOptionsProvider.setOption('default_state', 'members');
        // AdminCoreOptionsProvider.setOption('available_languages', ['en', 'fr']);
        // AdminCoreOptionsProvider.setOption('deactivate_sidenav', true);
        // AdminCoreOptionsProvider.setOption('side_navigation', [
        //     {
        //         group_name: 'SIDE_NAV_BOOKINGS',
        //         items: ['calendar', 'clients', 'check-in', 'dashboard-iframe', 'members-iframe']
        //     }, {
        //         group_name: 'SIDE_NAV_CONFIG',
        //         items: ['config-iframe', 'publish-iframe', 'settings-iframe', 'custom']
        //     }
        // ]);

        // AdminDashboardIframeOptionsProvider.setOption('use_default_states', false);
        // AdminDashboardIframeOptionsProvider.setOption('show_in_navigation', false);

        // AdminLoginOptionsProvider.setOption('sso_token', 'eyJlbWFpbCI6ImFkbWluMUBleGFtcGxlLmNvbSJ9');
        // AdminLoginOptionsProvider.setOption('company_id', '37000');

        // AdminMembersIframeOptionsProvider.setOption('use_default_states', false);
        // AdminMembersIframeOptionsProvider.setOption('show_in_navigation', false);

        // AdminPublishIframeOptionsProvider.setOption('use_default_states', false);
        // AdminPublishIframeOptionsProvider.setOption('show_in_navigation', false);

        // AdminSettingsIframeOptionsProvider.setOption('use_default_states', false);
        // AdminSettingsIframeOptionsProvider.setOption('show_in_navigation', false);
    }

})(angular);
