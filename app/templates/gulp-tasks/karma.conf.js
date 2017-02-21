(function () {
    'use strict';

    module.exports = function (config) {
        return config.set({
            autoWatch: true,
            browsers: ['PhantomJS'],

            babelPreprocessor: {
                options: {
                    presets: ['es2015'],
                    sourceMap: 'inline'
                },
                filename: function (file) {
                    return file.originalPath.replace(/\.js$/, '.es5.js');
                },
                sourceFileName: function (file) {
                    return file.originalPath;
                }
            },
            coverageReporter: {
                instrumenters: {isparta: require('isparta')},
                instrumenter: {
                    'src/*.js': 'isparta'
                },
                reporters: [
                    {
                        type: 'lcov',
                        dir: './test/unit/reports/coverage-lcov/',
                        file: 'lcov.info',
                        subdir: '.'
                    }
                ]
            },
            colors: true,
            frameworks: ['jasmine'],
            logLevel: config.LOG_INFO,
            port: 9876,
            preprocessors: {
                'src/javascripts/**/*.js': ['babel'],
                'src/javascripts/**/!(*.spec).js': ['coverage']
            },
            reporters: ['dots', 'coverage'],
            singleRun: false
        });
    };

})();
