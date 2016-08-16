(function () {
    module.exports = function (gulp, plugins, path) {

        var del = require('del');

        gulp.task('build-project-clean', cleanTask);

        function cleanTask(cb) {
            del.sync([plugins.config.projectTmpPath]);
            cb();
        }
    };

}).call(this);
