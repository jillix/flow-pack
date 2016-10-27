'use strict'

const fs = require('fs');
const exec = require('child_process').exec;
const bundler = require('./lib/browserify');
const module_name = 'flow-browser';
const replace_read = /FLOW_READ_URL/;
const replace_module = /FLOW_MODULE_URL/;

exports.client = function (args, data, next) {
    bundler(args.target, {
        file: module_name,
        expose: module_name,
        replace: [
            {from: replace_read, to: process.flow_env.browser.read},
            {from: replace_module, to: process.flow_env.browser.mod}
        ]
    }, (err, module) => {
        data.file = module;
        next(err, data);
    });
};

exports.bundle = function (args, data, next) {

    const module_name = data.module.slice(0, -3);
    const file_path = args.target + '/' + module_name + '.js';
    const repo = data.owner + '/' + module_name + (module_name === 'builder' ? '#pure-graph' : '#flow_v0.1.0');
    const done  = (err, module) => {
        data.file = file_path;
        next(err, data); 
    };

    fs.access(process.cwd() + '/node_modules/' + module_name, (err) => {

        if (err) {
             return exec('npm i --prefix ' + process.cwd() + ' ' + repo, err => {

                if (err) {
                    return next(err);
                }

                bundle(file_path, module_name, done);
            });
        }

        bundle(file_path, module_name, done);
    });
}; 

function bundle (file_path, module_name, done) {
    bundler(file_path, {
        file: module_name,
        expose: module_name
    }, done);
}
