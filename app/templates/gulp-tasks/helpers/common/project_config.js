(function () {
    'use strict';

    var args = require('./args.js');
    var deepMerge = require('deepmerge');
    var fs = require('fs');
    var fsFinder = require('fs-finder');
    var jsonFile = require('jsonfile');
    var path = require('path');

    module.exports = {
        getConfig: getConfig
    };

    /**
     * @returns {Object}
     */
    function getConfig() {

        var config = {};

        var environment = getEnvironmentName();

        getConfigFileNames().forEach(function (configFileName) {

            var loadedData = getConfigData(configFileName);

            if(typeof loadedData.general === 'undeinfed'){
                throw new Error('general section of conifg file is required, filename = ' + configFileName);
            }

            config = deepMerge(config, loadedData.general);

            if(typeof loadedData[environment] !== 'undefined'){
                config = deepMerge(config, loadedData[environment])
            }
        });

        applyEnforcedValues(config);

        setSdkVersion(config);

        return config;
    }

    /**
     * @returns {Array.<String>}
     */
    function getConfigFileNames() {
        return fsFinder.in('./').findFiles('config.json').concat(fsFinder.from('./src/config').findFiles('*.json'));
    }

    /**
     * @param {String} filename
     * @returns {Object}
     */
    function getConfigData(filename) {
        try {
            return jsonFile.readFileSync(filename);
        } catch (error1) {
            console.log('could not load config file: ' + filename);
            return {};
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

    /**
     * @param {Object}
     * @throws {Error}
     */
    function setSdkVersion(config) {

        if (config.build.local_sdk === true) {
            config.build.sdk_version = null;
            return
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


}).call(this);
