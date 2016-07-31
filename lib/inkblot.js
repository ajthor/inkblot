'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const globby = require('globby');
const diff = require('diff');
const Promise = require('bluebird');

Promise.promisifyAll(fs);
// Regex-fu.
// const regexSection = /(?:\/\/\sTEST[\r?\n])([\s\S]*?)(?:[\r?\n]\/\/\sEND)/g;
const regexNamedBlock = /(?:\/\/\sTEST\s*?{([\s\S]+?)}[\r?\n])([\s\S]*?)(?:[\r?\n]\/\/\sEND)/g;
const regexBlock = /(^test[\s\S]+?^}\);)/gm;
// const regexBlock = /(^test[^)]+^}\)\S?\n)/gm;
// const matchingParentheses = /\(([^)]+)\)/;
// const regexTest = new RegExp(`(?:[\r?\n]\()`);
// description (?:\()'([\s\S]+?)'

const matchRegex = (text, regex) => {
  let match = regex.exec(text);
  const matches = [];
  while (match) {
    matches.push(match);
    match = regex.exec(text);
  }
  return matches;
};

const getSourceBlocks = file => {
  return fs.readFileAsync(file, 'utf8')
    .then(contents => matchRegex(contents, regexNamedBlock));
};

const getTestBlocks = file => {
  return fs.accessAsync(file, fs.F_OK)
    // Create the file if it doesn't already exist and add 'boilerplate'.
    .catch(() => fs.appendFileAsync(file, `'use strict';\nimport test from 'ava';\n`))
    .then(() => fs.readFileAsync(file, 'utf8'))
    .then(contents => matchRegex(contents, regexNamedBlock));
};

// Create NAMED SECTIONS { NAME }
const softMerge = (source, target) => {
  let compiledTarget = [];
  source.forEach(block => {
    const name = block[1].trim();

    let matchedBlock = '';
    target.forEach(targetBlock => {
      const targetName = targetBlock[1].trim();
      if (name === targetName) {
        matchedBlock = targetBlock;
      }
    });

    let changes = '';
    if (matchedBlock !== '') {
      const patch = diff.structuredPatch('target', 'source', matchedBlock[0], block[0]);
      changes = diff.applyPatch(matchedBlock[0], patch);
    } else {
      changes = block[0];
    }

    compiledTarget.push(changes + '\n\n');
  });

  return compiledTarget;
};

const hardMerge = (updates, target) => {
  
}

// Merge Tests
const mergeTests = (globs, options) => {
  // For when no globs are given.
  if (globs.length === 0) {
    globs = ['**/*.{js, jsx}'];
  }

  return Promise.resolve(globby(globs, {ignore: options.ignore}))
    .each(sourcePath => {
      const testDir = `${path.resolve(path.dirname(__dirname), 'test')}`;
      const testPath = `${testDir}/test_${path.parse(sourcePath).name}.js`;

      const sourceBlocks = getSourceBlocks(sourcePath);
      const testBlocks = getTestBlocks(testPath);

      return Promise.join(sourceBlocks, testBlocks, (sourceBlocks, testBlocks) => {
          // Compare blocks and see if we should add or update.
          const merge = softMerge(sourceBlocks, testBlocks);
          console.log(merge);
        });
    });
};

module.exports = {
  mergeTests
};
