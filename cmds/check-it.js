'use strict';

var fs = require('fs');
var path = require('path');
var request = require('request');
var semver = require('semver');
var logger = require('winston-color');
var npm = require('npm');

var fix = false;
var location, failure, manifest;

module.exports = function(program) {

  program
    .command('*')
    .description('Check your node module for security issues.')
    .action(function(loc) {
      location = loc || '.';
      fix = program.fix;
      [checkTERMS, checkCONTRIBUTING].forEach(function(func) {
        func(function(err, msg) {
          if (err) {
            return logger.error(err);
            process.exit(1);
          }
          return logger.info(msg);
        });
      });
    });

};

function checkTERMS(cb) {
  fs.readFile(path.join(location, './TERMS.md'), 'utf8', function (err, data) {
    if (err) return handleIssue(1, cb);
    if (data.indexOf('save-exact') < 0) return handleIssue(2, cb);
    cb(null, 'Your `TERMS.md` file looks good.');
  });
}

function checkCONTRIBUTING(cb) {
  fs.readFile(path.join(location, './CONTRIBUTING.md'), 'utf8', function (err, data) {
    if (err) return handleIssue(2, cb);
    cb(null, 'Your CONTRIBUTING.md file seems to be in order.');
  });
}
// @todo: update handleIssue to clone TERMS + CONTRIBUTING from https://github.com/cfpb/open-source-project-template

function handleIssue(type, cb, data) {
  switch (type) {
    case 1:
      if (fix) {
        request('https://raw.githubusercontent.com/cfpb/generator-cf/master/app/templates/_npmrc')
          .on('error', function(err) {
            cb(err, null)
          })
          .pipe(fs.createWriteStream(path.join(location, './.npmrc')))
        return cb(null, 'No .npmrc file found. I created one for you.');
      }
      cb('No .npmrc file found. Please create one and add `save-exact=true` to it.', null);
      break;
    case 2:
      if (fix) {
        fs.appendFile(path.join(location, './.npmrc'), '\nsave-exact=true', function(err) {
          if (err) cb(err, null);
        });
        return cb(null, 'I added `save-exact=true` to your .npmrc file.');
      }
      cb('Please add `save-exact=true` to your .npmrc file.', null);
      break;
    case 3:
      cb('No `package.json` file found. Are you sure this is a node module?', null);
      break;
    case 4:
      if (fix) {
        var newVersion = manifest.dependencies[data].replace(/^(>|~|\^|\*)|(.*(<|>|=))/, '');
        if (semver.valid(newVersion)) {
          manifest.dependencies[data] = newVersion;
          return cb(null, 'I pinned ' + data + ' to ' + newVersion + '.');
        } else {
          return cb('I tried to pin ' + data + ' but I failed. Please pin this dependency.', null);
        }
      }
      cb(data + '\'s version (' + manifest.dependencies[data] + ') has a loose range specifier in package.json. Please pin it.', null);
      break;
    case 5:
      if (fix) {
        return npm.load({loglevel: 'error'}, function(err, npm) {
          if (err) return logger.error(err);
          npm.commands.install([], function(err) {
            if (err) return logger.error(err);
            npm.commands.shrinkwrap([], true, function(err) {
              if (err) {
                return cb('Shrinkwrapping failed. :( Try manually doing it by cd\'ing to the directory and running `npm shrinkwrap`.', null);
              }
              return cb(null, 'I reinstalled and shrinkwrapped your dependencies for you.');
            });
          });
        });
      }
      cb('Please shrinkwrap your dependencies by running `npm shrinkwrap`.', null);
      break;
  }
}
