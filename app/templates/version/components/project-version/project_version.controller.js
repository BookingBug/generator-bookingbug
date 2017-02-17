(function (angular) {
    'use strict';

    angular.module('<%= module_name %>.version').controller('BbProjectVersionController', BbProjectVersionController);

    function BbProjectVersionController(bbConfig) {
        'ngInject';

        function init() {
            exposeVersions();
        }

        function exposeVersions() => {

            this.sdk_version = bbConfig.BUILD.SDK_VERSION;
            if (this.sdk_version === null) {
                this.sdk_version = 'unreleased version';
            }

            this.project_deploy_version = bbConfig.BUILD.DEPLOY_VERSION;
            if (this.project_deploy_version === false) {
                this.project_deploy_version = 'unreleased version';
            }

            this.show_version = bbConfig.BUILD.SHOW_VERSION;
        }

        init();
    }

})(angular);
