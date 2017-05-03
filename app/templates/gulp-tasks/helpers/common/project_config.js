(function () {
    'use strict';

    const args = require('./args.js');
    const deepMerge = require('deepmerge');
    const fs = require('fs');
    const fsFinder = require('fs-finder');
    const jsonFile = require('jsonfile');
    const path = require('path');

    module.exports = {
        getConfig: getConfig
    };

    /**
     * @returns {Object}
     */
    function getConfig() {

        let config = {};

        let environment = getEnvironmentName();

        getConfigFileNames().forEach(function (configFileName) {

            let loadedData = getConfigData(configFileName);

            if(typeof loadedData.general === 'undefined'){
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
        let env = args.getEnvironment();
        let environmentName = 'development';

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
        if (args.forceLocalSdk() !== null) {
            config.build.local_sdk = args.forceLocalSdk();
        }

        if (args.forceUglify() !== null) {
            config.build.uglify = args.forceUglify();
        }

        if (args.forceDeployVersion() !== null) {
            config.build.deploy_version = args.forceDeployVersion();
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

        let bowerJson = JSON.parse(fs.readFileSync('bower.json', 'utf8'));

        for (let depName in bowerJson.dependencies) {
            let depVersion = bowerJson.dependencies[depName];
            if (new RegExp(/^bookingbug-angular.*/).test(depName)) {
                config.build.sdk_version = depVersion;
                return;
            }
        }

        throw new Error('No BB dependency found.');
    }


})();
