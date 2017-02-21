(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');

    module.exports = function (gulp, configuration) {

        gulp.task('copy', copyTask);

        function copyTask(cb) {

            let copyList = getCopyList();

            for(let i = 0; i < copyList.length; i++){
                let copyEntry = copyList[i];
                let from = copyEntry.from.map(function(glob){ return path.join(configuration.projectRootPath, glob); });
                let to = path.join(configuration.projectRootPath, copyEntry.to);
                gulp.src(from).pipe(gulp.dest(to));
            }

            cb();
        }

        /**
         * @returns {Array.<Object>}
         **/
        function getCopyList() {
            let bowerJsonPath = path.join(configuration.projectRootPath, 'bower.json');
            let bowerJson = JSON.parse(fs.readFileSync(bowerJsonPath, 'utf8'));

            if (typeof bowerJson.release !== 'undefined' && typeof bowerJson.release.copy !== 'undefined') {
                return bowerJson.release.copy;
            }

            return [];
        }
    };

})();
