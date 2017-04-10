(function (angular) {
    'use strict';

    angular.module('<%= module_name %>').config(moduleConfig);

    function moduleConfig(bbConfig, bbAnalyticsPiwikProvider) {
        'ngInject';

        // enable Piwik Analytics
        if (bbConfig.CORE.ANALYTICS.ENABLE_PIWIK) bbAnalyticsPiwikProvider.enable();

    }

})(angular);
