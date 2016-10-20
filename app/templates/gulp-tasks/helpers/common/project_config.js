(function () {
    'use strict';

    var args = require('./args.js');
    var deepMerge = require('deepmerge');
    var fs = require('fs');
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
            config = applyEnvironmentSpecificSettings(config, configData);
        }

        applyEnforcedValues(config);

        setSdkVersion(config);

        return config;
    }

    /**
     * @param {Object}
     * @throws {Error}
     */
    function setSdkVersion(config) {

        if (config.build.local_sdk === true) {
            config.build.sdk_version = "?";
        }

        var bowerJson = JSON.parse(fs.readFileSync('bower.json', 'utf8'));

        for (var depName in bowerJson.dependencies) {
            var depVersion = bowerJson.dependencies[depName];
            if (new RegExp(/^bookingbug-angular.*/).test(depName)) {
                config.build.sdk_version = depVersion;
                return;
            }
        }

        throw new Error('No BB dependency found.');
    }

    /**
     * @returns {Object}
     */
    function getConfigData() {
        try {
            return jsonFile.readFileSync('config.json');
        } catch (error1) {
            console.log('No config file specified for project');
            return {};
        }
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
     * @returns {Object}
     */
    function applyEnvironmentSpecificSettings(config, configData) {
        var environmentName = getEnvironmentName();
        return deepMerge(config, configData[environmentName]);
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
            config.build.local_sdk = true;
        }

        if (args.forceLocalSdk() === false) {
            config.build.local_sdk = false;
        }

        if (args.forceUglify() === true) {
            config.build.uglify = true;
        }

        if (args.forceUglify() === false) {
            config.build.uglify = false;
        }
    }


}).call(this);
