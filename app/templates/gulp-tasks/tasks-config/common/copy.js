(function () {
    'use strict';

    var fs = require('fs');
    var path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('copy', copyTask);

        function copyTask(cb) {

            var copyList = getCopyList();

            for(var i = 0; i < copyList.length; i++){
                var copyEntry = copyList[i];
                var from = copyEntry.from.map(function(glob){ return path.join(configuration.projectRootPath, glob); });
                var to = path.join(configuration.projectRootPath, copyEntry.to);
                gulp.src(from).pipe(gulp.dest(to));
            }

            cb();
        }

        /**
         * @returns {Array.<Object>}
         **/
        function getCopyList() {
            var bowerJsonPath = path.join(configuration.projectRootPath, 'bower.json');
            var bowerJson = JSON.parse(fs.readFileSync(bowerJsonPath, 'utf8'));

            if (typeof bowerJson.release !== 'undefined' && typeof bowerJson.release.copy !== 'undefined') {
                return bowerJson.release.copy;
            }

            return [];
        }
    };

}).call(this);
