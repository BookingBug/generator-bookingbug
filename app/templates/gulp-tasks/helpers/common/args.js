(function () {
    'use strict';

    var argv = require('yargs').argv;

    var allowedOptions = ['env', 'localSdk', 'uglify'];

    validateAllowedOptions();

    module.exports = {
        forceLocalSdk: forceLocalSdk,
        forceUglify: forceUglify,
        getEnvironment: getEnvironment
    };

    /**
     * @returns {Boolean|null}
     */
    function forceLocalSdk() {

        if(argv['localSdk'] === 'true'){
            return true;
        }

        if(argv['localSdk'] === 'false'){
            return false;
        }

        if (typeof argv['localSdk'] !== 'undefined') {
            console.log('localSdk possible values: true, false');
            process.exit(1);
        }

        return null;
    }

    /**
     * @returns {Boolean|null}
     */
    function forceUglify() {

        if(argv['uglify'] === 'true'){
            return true;
        }

        if(argv['uglify'] === 'false'){
            return false;
        }

        if (typeof argv['uglify'] !== 'undefined') {
            console.log('uglify possible values: true, false');
            process.exit(1);
        }

        return null;
    }

    /*
     * @returns {String} ['local'|'dev'|'staging'|'prod']
     */
    function getEnvironment() {
        var environment = 'dev';
        var environmentOptions = ['local', 'dev', 'staging', 'prod'];

        if (typeof argv.env !== 'undefined') {
            if (environmentOptions.indexOf(argv.env) === -1) {
                console.log('env can have one of the following values: ' + environmentOptions);
                process.exit(1);
            }
            environment = argv.env;
        }
        return environment;
    }

    function validateAllowedOptions() {

        var options = allowedOptions.concat(['_', '$0']);//argv specific props

        for (var prop in argv) {
            if (options.indexOf(prop) === -1) {
                console.log('not recognized option:', prop);
                process.exit(1);
            }
        }
    }

}).call(this);
