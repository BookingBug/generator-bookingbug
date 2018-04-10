'use strict';

const demoTagName = 'v0.0.12';
const childProcess = require('child_process');
const jsonFile = require('jsonfile');
const s3 = require('s3');
const git = require('simple-git');

module.exports = class extends require('yeoman-generator') {

    constructor(args, opts) {
        super(args, opts);

        this.option('name', {
            desc: "Project name",
            default: 'test',
            type: String
        });
        this.option('company-id', {
            desc: "Company ID",
            default: 37000,
            type: Number
        });

        this.option('google-maps-key', {
            desc: "Google Maps Key (leave blank if you don't have one)",
            default: '',
            type: String
        });

        this.option('skip-npm', {
            desc: "Skip installing npm dependencies",
            type: Boolean,
            default: false
        });

        this.option('skip-prompts', {
            desc: 'Skip all prompts',
            type: Boolean,
            defaults: false
        });

        this.option('bb-dev', {
            desc: "Internal use only. Will check if your project name is available on aws 'bespoke' bucket.",
            type: Boolean,
            defaults: false
        });
    }

    async initializing() { // Your initialization methods (checking current project state, getting configs, etc)
        await this._checkGeneratorVersion();
    }

    async prompting() {// Where you prompt users for options (where you'd call this.prompt())

        if (!this.options['skip-prompts']) {
            await this._promptName();

            this._declareApiUrlOptions();

            await this._promptCompanyId();
            await this._promptApiUrlDevelopment();
            await this._promptApiUrlStaging();
            await this._promptApiUrlProduction();
            await this._promptGoogleMapsKey();
        } else {
            const isValid = await this._validateProjectName(this.options['name']);
            if (isValid !== false) {
                this.log(isValid);
                process.exit(0);
            }

            this._declareApiUrlOptions(this.options['name']);
        }

        await this._downloadDemoTaggedVersion();
    }

    configuring() {// - Saving configurations and configure the project (creating .editorconfig files and other metadata files)

        this.publicConfigPath = this.destinationPath(`${this.options['name']}/src/public/config.json`);
        this.studioConfigPath = this.destinationPath(`${this.options['name']}/src/studio/config.json`);
        this.memberConfigPath = this.destinationPath(`${this.options['name']}/src/member/config.json`);
        this.packageJsonPath = this.destinationPath(`${this.options['name']}/package.json`);

        this.publicConfig = jsonFile.readFileSync(this.publicConfigPath);
        this.studioConfig = jsonFile.readFileSync(this.studioConfigPath);
        this.memberConfig = jsonFile.readFileSync(this.memberConfigPath);
        this.packageJson = jsonFile.readFileSync(this.packageJsonPath);

        this.publicConfig.general.build.app_name = `${this.options['name']}-public`;
        this.studioConfig.general.build.app_name = `${this.options['name']}-studio`;
        this.memberConfig.general.build.app_name = `${this.options['name']}-member`;

        this.publicConfig.general.core.google_maps_key = this.options['google-maps-key'];
        this.memberConfig.general.core.google_maps_key = this.options['google-maps-key'];
        this.studioConfig.general.core.google_maps_key = this.options['google-maps-key'];

        this.publicConfig.general.core.company_id = this.options['company-id'];
        this.memberConfig.general.core.company_id = this.options['company-id'];
        this.studioConfig.general.core.company_id = this.options['company-id'];

        this.publicConfig.general.build.deploy_version = 'v0.0.0';
        this.memberConfig.general.build.deploy_version = 'v0.0.0';
        this.studioConfig.general.build.deploy_version = 'v0.0.0';

        this.publicConfig.development.build.deploy_path = `${this.options['name']}-public/development/`;
        this.publicConfig.staging.build.deploy_path = `${this.options['name']}-public/staging/`;
        this.publicConfig.production.build.deploy_path = `${this.options['name']}-public/`;
        this.memberConfig.development.build.deploy_path = `${this.options['name']}-member/development/`;
        this.memberConfig.staging.build.deploy_path = `${this.options['name']}-member/staging/`;
        this.memberConfig.production.build.deploy_path = `${this.options['name']}-member/`;
        this.studioConfig.development.build.deploy_path = `${this.options['name']}-studio/development/`;
        this.studioConfig.staging.build.deploy_path = `${this.options['name']}-studio/staging/`;
        this.studioConfig.production.build.deploy_path = `${this.options['name']}-studio/`;

        this.publicConfig.local.core.api_url = 'http://localhost:3000';
        this.publicConfig.development.core.api_url = this.options['api-url-development'];
        this.publicConfig.staging.core.api_url = this.options['api-url-staging'];
        this.publicConfig.production.core.api_url = this.options['api-url-production'];
        this.memberConfig.local.core.api_url = 'http://localhost:3000';
        this.memberConfig.development.core.api_url = this.options['api-url-development'];
        this.memberConfig.staging.core.api_url = this.options['api-url-staging'];
        this.memberConfig.production.core.api_url = this.options['api-url-production'];
        this.studioConfig.local.core.api_url = 'http://localhost:3000';
        this.studioConfig.development.core.api_url = this.options['api-url-development'];
        this.studioConfig.staging.core.api_url = this.options['api-url-staging'];
        this.studioConfig.production.core.api_url = this.options['api-url-production'];
        this.packageJson.name = this.options['name'];
        this.packageJson.version = '0.0.0';
    }

    default() {// - If the method name doesn't match a priority, it will be pushed to this group.
    }

    writing() {// - Where you write the generator specific files (routes, controllers, etc)
        jsonFile.writeFileSync(this.publicConfigPath, this.publicConfig, {spaces: 2});
        jsonFile.writeFileSync(this.studioConfigPath, this.studioConfig, {spaces: 2});
        jsonFile.writeFileSync(this.memberConfigPath, this.memberConfig, {spaces: 2});
        jsonFile.writeFileSync(this.packageJsonPath, this.packageJson, {spaces: 2});
    }

    conflicts() {// - Where conflicts are handled (used internally)
    }

    install() { //- Where installations are run (npm, bower)
        if (this.options['skip-npm']) return;
        childProcess.execSync(`
            cd ${this.options['name']} && 
            npm run i`,
            {stdio: 'inherit'}
        );
    }

    end() {// Called last, cleanup, say good bye, etc
    }

    _declareApiUrlOptions() {
        const projectName = this.options['name'];

        this.option('api-url-production', {
            desc: "API URL for production",
            default: `https://${projectName}.bookingbug.com`,
            type: String
        });
        this.option('api-url-staging', {
            desc: "API URL for staging",
            default: `https://${projectName}-staging.bookingbug.com`,
            type: String
        });
        this.option('api-url-development', {
            desc: "API URL for development",
            default: `https://${projectName}-dev.bookingbug.com`,
            type: String
        });

        this.options['name'] = projectName; //for some reason re-declaring options above resets options['name']
    }

    _promptName() {
        return this.prompt({
            type: 'input',
            name: 'appName',
            message: 'What is the name of your project?',
            validate: this._validateProjectName.bind(this)
        }).then(async (response) => {
            this.options['name'] = response.appName;
        });
    }

    async _validateProjectName(name) {

        if (name.match(/^[a-zA-Z0-9-]+$/)) {
            if (!this.options['bb-dev']) return true;
            return await this._validateProjectNameOnS3(name);
        }

        return `'${name}' is not allowed project name. Please use alphanumeric characters only.`;
    }

    _validateProjectNameOnS3(name) {
        return new Promise((resolve, reject) => {
            const s3Client = s3.createClient({
                s3Options: {
                    region: 'eu-west-1'
                }
            });

            s3Client.s3.listObjects({
                Bucket: 'bespoke.bookingbug.com',
                Prefix: name + '/'

            }, (err, data) => {

                if (err !== null) {
                    resolve(err);
                } else if (data.Contents.length > 0) {
                    resolve(`Project '${name}' is already taken on bespoke.bookingbug.com - please choose an other name`);
                } else {
                    resolve(true);
                }
            });
        });
    }

    _validateUrl(apiUrl) {
        if (apiUrl.match(/http[s]?:\/\//)) return true;
        else return "Invalid protocol. Should be http:// or https://";
    }

    _validateCompanyId(companyId) {
        if (companyId.toString().match(/^\d+$/)) return true;
        else return "Numbers only";
    }

    _promptCompanyId() {
        return this.prompt({
            type: 'input',
            name: 'companyId',
            message: 'What is your BookingBug company id?',
            default: this.options['company-id'],
            validate: this._validateCompanyId.bind(this)
        }).then((response) => {
            this.options['company-id'] = response.companyId;
        });
    }

    _promptApiUrlProduction() {
        return this.prompt({
            type: 'input',
            name: 'apiUrl',
            message: 'What is the production API URL?',
            default: this.options['api-url-production'],
            validate: this._validateUrl.bind(this)
        }).then((response) => {
            this.options['api-url-production'] = response.apiUrl;
        });
    }

    _promptApiUrlStaging() {
        return this.prompt({
            type: 'input',
            name: 'apiUrl',
            message: 'What is the staging API URL?',
            default: this.options['api-url-staging'],
            validate: this._validateUrl.bind(this)
        }).then((response) => {
            this.options['api-url-staging'] = response.apiUrl;
        });
    }

    _promptApiUrlDevelopment() {
        return this.prompt({
            type: 'input',
            name: 'apiUrl',
            message: 'What is the development API URL?',
            default: this.options['api-url-development'],
            validate: this._validateUrl.bind(this)
        }).then((response) => {
            this.options['api-url-development'] = response.apiUrl;
        });
    }

    _promptGoogleMapsKey() {
        return this.prompt({
            type: 'input',
            name: 'googleMapsKey',
            message: 'If you have a Google Maps Key please enter it here, otherwise leave blank',
            default: this.options['google-maps-key']
        }).then((response) => {
            this.options['google-maps-key'] = response.googleMapsKey;
        });
    }

    _downloadDemoTaggedVersion() {
        return new Promise((resolve, reject) => {

            git().silent(false)
                .raw(['clone', 'https://github.com/BookingBug/demo.git', this.options['name']], (err, result) => {
                    if (err) {
                        this.log(err);
                        this.log(`Please either remove "${this.options['name']}" directory or choose different project name`);
                        process.exit(0);
                    }
                    git(this.destinationPath(`${this.options['name']}`)).silent(false)
                        .raw(['checkout', demoTagName], (err, result) => {

                            if (err) {
                                this.log(err);
                                this.log(`Could not checkout tag ${demoTagName}`);
                                process.exit(0);
                            }

                            childProcess.execSync(`cd ${this.options['name']} && rm -rf .git`, {stdio: 'inherit'});

                            resolve()
                        });
                })
        });
    }

    _checkGeneratorVersion() {
        return new Promise((resolve, reject) => {

            const localVersion = require('../package.json').version.trim();

            childProcess.exec('npm view generator-bookingbug version', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }

                const newestVersion = stdout.trim();

                if ((newestVersion === localVersion) || this.options['skip-prompts']) {
                    resolve();
                    return;
                }

                this.prompt({
                    type: 'confirm',
                    name: 'shouldUpdateGenerator',
                    message: 'You are currently using version (' + localVersion + ') of generator-bookingbug. Would you like to update to the newest version? (' + newestVersion + ')'
                }).then((response) => {

                    if (!response.shouldUpdateGenerator) {
                        resolve();
                        return
                    }

                    childProcess.execSync(
                        `npm uninstall generator-bookingbug -g &&
                         npm install generator-bookingbug -g
                        `,
                        {stdio: 'inherit'}
                    );

                    this.log(`bookingbug generator has been successfully upgraded from ${localVersion} to ${newestVersion}`);
                    this.log(`Please rerun generator.`);

                    process.exit(0);
                    reject();
                });
            });
        });
    }
};
