(function (angular) {
    'use strict';

    angular.module('<%= module_name %>.version').controller('BbProjectVersionController', BbProjectVersionController);

    function BbProjectVersionController(bbConfig) {
        'ngInject';

        function init() {
            exposeVersions();
        }

        const exposeVersions = () => {

            this.sdkVersion = bbConfig.BUILD.SDK_VERSION;
            if (this.sdkVersion === null) {
                this.sdkVersion = 'unreleased version';
            }

            this.projectDeployVersion = bbConfig.BUILD.DEPLOY_VERSION;
            if (this.projectDeployVersion === false) {
                this.projectDeployVersion = 'unreleased version';
            }

            this.showVersion = bbConfig.BUILD.SHOW_VERSION;
        };

        init();
    }

})(angular);
