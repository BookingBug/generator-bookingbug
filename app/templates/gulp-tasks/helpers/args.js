(function () {
    'use strict';

    var argv = require('yargs').argv;

    module.exports = {
        getEnvironment: getEnvironment
    };

    /*
     * @returns {String} ['local'|'dev'|'staging'|'prod']
     */
    function getEnvironment() {
        var environment, environmentOptions;
        environment = 'dev';
        environmentOptions = ['local', 'dev', 'staging', 'prod'];
        if (typeof argv.env !== 'undefined') {
            if (environmentOptions.indexOf(argv.env) === -1) {
                console.log('env can has one of following values: ' + environmentOptions);
                process.exit(1);
            }
            environment = argv.env;
        }
        return environment;
    }

}).call(this);
