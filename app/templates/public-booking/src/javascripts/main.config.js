(function(angular) {
    'use strict';

    angular.module('<%= module_name %>').config(moduleConfig);

    function moduleConfig(bbConfig, $analyticsProvider) {
        'ngInject';

        $analyticsProvider.virtualPageviews(false);
        $analyticsProvider.firstPageview(false);

        var _paq = window._paq = window._paq || [];
        // _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        //TODO ULR from config and site id from config
        var u = "https://analytics.bookingbug.com/";
        _paq.push(['setTrackerUrl', u + 'piwik.php']);
        _paq.push(['setSiteId', 1]);
        var d = document;
        var g = d.createElement('script');
        var s = d.getElementsByTagName('script')[0];
        g.type = 'text/javascript';
        g.async = true;
        g.defer = true;
        g.src = u + 'piwik.js';
        s.parentNode.insertBefore(g, s);
    }

})(angular);
