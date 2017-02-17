(function (angular) {
    'use strict';

    angular.module('<%= module_name %>.version').run(function (bbConfig, $window) {
        'ngInject';

        function init() {
            exposeVersions();
        }

        function exposeVersions() {

            let sdkVersion = bbConfig.BUILD.SDK_VERSION;
            if (sdkVersion === null) {
                sdkVersion = 'unreleased version';
            }

            let projectDeployVersion = bbConfig.BUILD.DEPLOY_VERSION;
            if (projectDeployVersion === false) {
                projectDeployVersion = 'unreleased version';
            }

            $window.BB = {
                SDK_VERSION: sdkVersion,
                PROJECT_DEPLOY_VERSION: projectDeployVersion
            };
        }

        init();
    });

})(angular);
