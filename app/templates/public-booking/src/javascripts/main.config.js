(function (angular) {
    'use strict';

    angular.module('<%= module_name %>').config(moduleConfig);

    function moduleConfig(bbConfig, BBAnalyticsPiwikProvider) {
        'ngInject';

        // enable Piwik Analytics
        if (bbConfig.CORE.ANALYTICS.ENABLE_PIWIK) BBAnalyticsPiwikProvider.enable();

    }

})(angular);
