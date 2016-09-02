'use strict';

var fs = require('fs');
var path = require('path');
var request = require('request');
var logger = require('winston-color');
var npm = require('npm');
var shell = require("shelljs");

var fix = false;
var scrub = false;
var location, failure, manifest;

module.exports = function(program) {

  program
    .command('*')
    .description('Check that your project repo meets CFPB\'s open source checklist requirements.')
    .action(function(loc) {
      location = loc || '.';
      fix = program.fix;
      scrub = program.scrub;
      [checkPII, checkTERMS, checkCONTRIBUTING, checkCHANGELOG, checkENV].forEach(function(func) {
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

function checkPII(cb) {
  // Has PII been removed?
}

function checkTERMS(cb) {
  fs.readFile(path.join(location, './TERMS.md'), 'utf8', function (err, data) {
    if (err) return handleIssue(1, cb);
    cb(null, 'Your TERMS.md file looks good.');
  });
}

function checkCONTRIBUTING(cb) {
  fs.readFile(path.join(location, './CONTRIBUTING.md'), 'utf8', function (err, data) {
    if (err) return handleIssue(2, cb);
    cb(null, 'Your CONTRIBUTING.md file seems to be in order.');
  });
}

function checkCHANGELOG(cb) {
  fs.readFile(path.join(location, './CHANGELOG.md'), 'utf8', function (err, data) {
    if (err) return handleIssue(3, cb);
    cb(null, 'Your CHANGELOG.md file is good to go.');
  });
}

function checkENV(cb) {
  fs.readFile(path.join(location, './.env'), 'utf8', function (err, data) {
      if (err) return handleIssue(4, cb);
      var envPath = path.join(location, './.env');
      shell.exec('. ' + envPath);
    });
}

function scrubGHEReferences(cb) {
  if (scrub) {
    // checkENV(cb);
    //   // do the thing
    //   shell.exec('./scrub.sh');
  }
}

function handleIssue(type, cb, data) {
  switch (type) {
    case 1:
      if (fix) {
        request('https://raw.githubusercontent.com/cfpb/open-source-project-template/master/TERMS.md')
          .on('error', function(err) {
            cb(err, null)
          })
          .pipe(fs.createWriteStream(path.join(location, './TERMS.md')))
        return cb(null, 'No TERMS.md file found. I created one for you.');
      }
      cb('No TERMS.md file found. Please create one based on the Open Source Project Template: https://github.com/cfpb/open-source-project-template/blob/master/TERMS.md', null);
      break;
    case 2:
      if (fix) {
        request('https://raw.githubusercontent.com/cfpb/open-source-project-template/master/CONTRIBUTING.md')
          .on('error', function(err) {
            cb(err, null)
          })
          .pipe(fs.createWriteStream(path.join(location, './CONTRIBUTING.md')))
        return cb(null, 'No CONTRIBUTING.md file found. I created one for you.');
      }
      cb('No CONTRIBUTING.md file found. Please create one based on the Open Source Project Template: https://github.com/cfpb/open-source-project-template/blob/master/CONTRIBUTING.md', null);
      break;
    case 3:
      if (fix) {
        request('https://raw.githubusercontent.com/cfpb/open-source-project-template/master/CHANGELOG.md')
          .on('error', function(err) {
            cb(err, null)
          })
          .pipe(fs.createWriteStream(path.join(location, './CHANGELOG.md')))
        return cb(null, 'No CHANGELOG.md file found. I created one for you.');
      }
      cb('No CHANGELOG.md file found. Please create one based on the Open Source Project Template: https://github.com/cfpb/open-source-project-template/blob/master/CHANGELOG.md', null);
      break;
    case 4:
      if (fix) {
        request('https://raw.githubusercontent.com/cfpb/open-source-checklist/master/.env_SAMPLE')
          .on('error', function(err) {
            cb(err, null)
          })
          .pipe(
            fs.createWriteStream(path.join(location, './.env')
          ))
          fs.appendFileSync(path.join(location, './.gitignore'), '.env', 'utf8');
        return cb(null, 'No .env file found. I created one for you and added it to your project\'s .gitignore. Now you should edit it to update the GHE_URL variable.');
      }
      cb('No .env file found. Please create one based on this sample, add it to your project\'s .gitignore, and update the GHE_URL variable: https://github.com/cfpb/open-source-checklist/blob/master/.env_SAMPLE', null);
      break;
  }
}
