(function () {
    'use strict';

    var args = require('./args.js');
    var jsonFile = require('jsonfile');

    module.exports = {
        getConfig: getConfig
    };

    function getConfig() {

        var env = args.getEnvironment();
        var config = {};

        var configOriginal = null;
        try {
            configOriginal = jsonFile.readFileSync('config.json');
        } catch (error1) {
            console.log('No config file specified for project');
            return {};
        }

        if (typeof configOriginal['general'] === 'undefined') {
            return configOriginal;
        }

        var environmentName = 'development';

        if (env.match(/local/)) {
            environmentName = 'local';
        } else if (env.match(/stag/)) {
            environmentName = 'staging';
        } else if (env.match(/prod/)) {
            environmentName = 'production';
        }

        for (var prop in configOriginal['general']) {
            config[prop] = configOriginal['general'][prop];
        }

        for (var prop in configOriginal[environmentName]) {
            config[prop] = configOriginal[environmentName][prop];
        }

        return config;
    }

}).call(this);
