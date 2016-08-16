(function () {
    var path = require('path');
    var fs = require('fs');
    var args = require('./args.js');
    var jsonFile = require('jsonfile');

    module.exports = {
        getConfig: getConfig
    };

    function getConfig() {
        var config, configOriginal, configPath, env, environmentFullname, error, error1, prop, propValue, ref, ref1;
        env = args.getEnvironment();
        config = {};
        configOriginal = null;
        configPath = 'config.json';
        try {
            configOriginal = jsonFile.readFileSync(configPath);
        } catch (error1) {
            error = error1;
            console.log('No config file specified for project');
            return {};
        }

        environmentFullname = 'development';
        if (env.match(/local/)) {
            environmentFullname = 'local';
        } else if (env.match(/stag/)) {
            environmentFullname = 'staging';
        } else if (env.match(/prod/)) {
            environmentFullname = 'production';
        }

        ref = configOriginal['general'];
        for (prop in ref) {
            propValue = ref[prop];
            config[prop] = propValue;
        }

        ref1 = configOriginal[environmentFullname];
        for (prop in ref1) {
            propValue = ref1[prop];
            config[prop] = propValue;
        }

        return config;
    }

}).call(this);
