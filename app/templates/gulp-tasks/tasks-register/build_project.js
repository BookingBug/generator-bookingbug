(function () {
    module.exports = function (gulp, plugins, path) {
        gulp.task('build-project', function (cb) {
            plugins.sequence(
                'build-sdk',
                'build-project-clean',
                'build-project-bower-prepare',
                'build-project-bower-install',
                'build-project-scripts:vendors',
                'build-project-scripts:sdk-no-templates',
                'build-project-scripts:sdk-only-templates',
                'build-project-scripts:client',
                'build-project-templates',
                'build-project-stylesheets',
                'build-project-fonts',
                'build-project-images',
                'build-project-www',
                cb
            );
        });
        gulp.task('build-project:watch', function (cb) {
            plugins.sequence(
                'build-project',
                'build-project-scripts:watch',
                'build-project-templates:watch',
                'build-project-stylesheets:watch',
                'build-project-images:watch',
                'build-project-fonts:watch',
                cb
            );
        });
    };

}).call(this);
