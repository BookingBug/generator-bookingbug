(function () {
    'use strict';

    var args = require('./args.js');
    var jsonFile = require('jsonfile');

    module.exports = {
        getConfig: getConfig
    };

    /**
     * @returns {Object}
     */
    function getConfig() {

        var config = {};

        var configData = getConfigData();

        if (typeof configData.general === 'undefined') {
            config = configData;
        } else {
            applyGeneralSettings(config, configData);
            applyEnvironmentSpecificSettings(config, configData);
        }

        applyEnforcedValues(config);

        return config;
    }

    /**
     * @returns {Object}
     */
    function getConfigData() {
        var configData = null;
        try {
            configData = jsonFile.readFileSync('config.json');
        } catch (error1) {
            console.log('No config file specified for project');
            return {};
        }

        return configData;
    }

    /**
     * @param {Object} config
     * @param {Object} configData
     */
    function applyGeneralSettings(config, configData) {
        if (typeof configData['general'] === 'undefined') {
            return configData;
        }

        for (var prop in configData['general']) {
            config[prop] = configData['general'][prop];
        }
    }

    /**
     * @param {Object} config
     * @param {Object} configData
     */
    function applyEnvironmentSpecificSettings(config, configData) {
        var environmentName = getEnvironmentName();
        for (var prop in configData[environmentName]) {
            config[prop] = configData[environmentName][prop];
        }
    }

    /**
     * @returns {String}
     */
    function getEnvironmentName() {
        var env = args.getEnvironment();
        var environmentName = 'development';

        if (env.match(/local/)) {
            environmentName = 'local';
        } else if (env.match(/stag/)) {
            environmentName = 'staging';
        } else if (env.match(/prod/)) {
            environmentName = 'production';
        }

        return environmentName;
    }

    /**
     * @param {Object} config
     */
    function applyEnforcedValues(config) {
        if (args.forceLocalSdk() === true) {
            config['local_sdk'] = true;
        }

        if (args.forceLocalSdk() === false) {
            config['local_sdk'] = false;
        }

        if (args.forceUglify() === true) {
            config.uglify = true;
        }

        if (args.forceUglify() === false) {
            config.uglify = false;
        }
    }


}).call(this);
