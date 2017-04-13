'use strict';

var chalk = require('chalk');
var fs = require('fs');
var install = require('spawn-npm-install');
var Package = require('./package');

var die = function die(message) {
    return console.error(chalk.bold.red(message));
};
var warn = function warn(message) {
    return console.warn(chalk.yellow(message));
};
var log = function log(message) {
    return console.log(chalk.green(message));
};

fs.readFile('package.json', 'utf-8', function (error, contents) {

    if (contents === undefined) {
        return die('There doesn\'t seem to be a package.json here');
    }

    var packageContents = new Package(contents);

    if (!packageContents.isValid()) {
        return die('Invalid package.json contents');
    }

    if (!packageContents.hasPeerDependencies()) {
        return warn('This package doesn\'t seem to have any peerDependencies');
    }

    var peerDependencies = packageContents.peerDependencies;

    var peerInstallOptions = packageContents.peerInstallOptions;

    log('Install ' + Object.keys(peerDependencies).length + ' peerDependencies...');
    var packages = Object.keys(peerDependencies).map(function (key) {
        var name = key + '@' + peerDependencies[key];
        return name;
    });

    var installDependencies = function installDependencies() {
        var name = packages.shift();
        install(name, peerInstallOptions, function () {
            log(name);
            installDependencies();
        });
    };
    installDependencies();
});
