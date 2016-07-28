'use strict';

const fs = require('fs');
const path = require('path');
const globby = require('globby');
const diff = require('diff');
const Promise = require('bluebird');

Promise.promisifyAll(fs);
// Regex-fu.
const rxBlock = /(?:\/\/\sTEST[\r?\n])([\s\S]*?)(?:[\r?\n]\/\/\sEND)/g;
const rxTest = /(?:test\(?'?)([\s\S]*?)(?:')/g;

const getAllRegexMatches = (string, regex) => {
  let match;
  const matches = [];
  while (match = regex.exec(string)) {
    matches.push(match);
  }
  return matches;
};

const getTestBlocks = file => {
  return fs.readFileAsync(file, 'utf8')
    .then(contents => {
      return getAllRegexMatches(contents, rxBlock);
    });
    // Then maybe remove tests from source and rewrite source file.
};

// Merge Tests
const mergeTests = (tests, testFile) => {

};

// Parse Files
const parseFiles = (globs, options) => {
  // For when no globs are given.
  if (globs.length === 0) {
    globs = ['**/*.{js, jsx}'];
  }

  return Promise.resolve(globby(globs, {ignore: options.ignore}))
    .each(file => {
      const testDir = `${path.resolve(path.dirname(__dirname), 'test')}`;
      const testPath = `${testDir}/test_${path.parse(file).name}.js`;
      const tests = getTestBlocks(file);
      const testFile = fs.accessAsync(testPath, fs.F_OK)
        // Create the file if it doesn't already exist and add 'boilerplate'.
        .catch(() => fs.appendFileAsync(testPath, `'use strict';\nimport test from 'ava';\n`))
        .then(() => fs.readFileAsync(testPath, 'utf8'));

      return Promise.join(tests, testFile, (tests, testFile) => {
        let testBlock = '\n';
        tests.forEach((test, index) => {
          testBlock += test[1] + '\n\n';
        });
      });
    });
};

module.exports = {
  parseFiles
};
