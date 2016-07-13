'use strict';
module.exports = function () {

    var config = {
        dist: 'dist',
        src: 'src',
        build: 'build',
        scriptsOrder: [
            './build/scripts/angular-busy-plus.module.js',
            './build/scripts/angular-busy-plus.factory.js',
            './build/scripts/angular-busy-plus.provider.js',
            './build/scripts/angular-busy-plus.value.js',
            './build/scripts/angular-busy-plus.directive.js',
            './build/scripts/**/*.js'
        ],
        buildScriptsOrder: [
            './build/scripts/angular-busy-plus.module.js',
            './build/scripts/angular-busy-plus.factory.js',
            './build/scripts/angular-busy-plus.provider.js',
            './build/scripts/angular-busy-plus.value.js',
            './build/scripts/angular-busy-plus.directive.js'
        ]
    };

    return config;

};
