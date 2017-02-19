const nodeCmd = require('node-cmd');
const packageJson = require('../package.json');

function checkGeneratorVersion() {
    let done = this.async();

    this.generatorLocalVersion = packageJson.version.trim();

    nodeCmd.get(
        'npm view generator-bookingbug version',
        checkNewVersion.bind(this, done)
    );
}

function checkNewVersion(done, version) {
    this.generatorNewestVersion = version.trim();

    if ((this.generatorNewestVersion === this.generatorLocalVersion) || this.options['skip-prompts']) {
        done();
        return;
    }

    this.prompt({
        type: 'confirm',
        name: 'shouldUpdateGenerator',
        message: 'You are currently using version (' + this.generatorLocalVersion + ') of generator-bookingbug. Would you like to update to the newest version? (' + this.generatorNewestVersion + ')'
    }, shouldInstallLatestVersion.bind(this, done));

}

function shouldInstallLatestVersion(done, response) {

    if (!response.shouldUpdateGenerator) {
        done();
        return
    }

    this.log('Installing generator-bookingbug', this.generatorNewestVersion);
    this.log('...Please Wait...');

    nodeCmd.get('npm remove generator-bookingbug -g', postRemoveGenerator.bind(this, done));
}

function postRemoveGenerator(done, data) {
    nodeCmd.get('npm install generator-bookingbug -g', postInstallGenerator.bind(this, done));
}

function postInstallGenerator(done, data) {
    this.log('Installed generator-bookingbug', this.generatorNewestVersion);
    process.exit(0);
    done();
}

module.exports = {
    checkGeneratorVersion: checkGeneratorVersion
};
