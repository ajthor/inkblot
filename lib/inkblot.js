'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const globby = require('globby');
const Promise = require('bluebird');

Promise.promisifyAll(fs);
// Regex-fu.
const regexBlock = /(?:\/\/\sTEST\s*?{([\s\S]+?)}[\r?\n])([\s\S]*?)(?:[\r?\n]\/\/\sEND)/g;

const matchRegex = (contents, regex) => {
  const matches = [];
  let match = regex.exec(contents);
  while (match) {
    matches.push(match);
    match = regex.exec(contents);
  }
  return matches;
};

const softMerge = (sourceBlocks, targetBlocks) => {
  const updates = [];
  sourceBlocks.forEach(sourceBlock => {
    let update = {};
    update.name = sourceBlock[1].trim();
    update.diff = sourceBlock[0];

    targetBlocks.forEach(targetBlock => {
      if (update.name === targetBlock[1].trim()) {
        update.orig = targetBlock[0];
        return false;
      }
    });

    updates.push(update);
  });

  return updates;
};

// Merge Tests
const mergeTests = (globs, options) => {
  // For when no globs are given.
  if (globs.length === 0) {
    globs = ['**/*.{js, jsx}'];
  }

  return Promise.resolve(globby(globs, {ignore: options.ignore}))
    .each(file => {
      const testDir = `${path.resolve(path.dirname(__dirname), 'test')}`;
      const testPath = `${testDir}/test_${path.parse(file).name}.js`;

      const sourceBlocks = fs.readFileAsync(file, 'utf8')
        .then(contents => matchRegex(contents, regexBlock));

      const targetFile = fs.accessAsync(file, fs.F_OK)
        // Create the file if it doesn't already exist and add 'boilerplate'.
        .catch(() => fs.appendFileAsync(file, `'use strict';\nimport test from 'ava';\n`))
        .then(() => fs.readFileAsync(testPath, 'utf8'));

      const targetBlocks = targetFile.then(contents => matchRegex(contents, regexBlock));

      return Promise.join(sourceBlocks, targetBlocks, (sourceBlocks, targetBlocks) => {
          // Perform update of all blocks.
          return softMerge(sourceBlocks, targetBlocks);
        })
        .then(updates => {
          let targetContents = targetFile.value();
          updates.forEach(update => {
            if (update.orig) {
              targetContents = targetContents.replace(update.orig, update.diff);
            } else {
              targetContents += '\n' + update.diff + '\n\n';
            }
          });

          return targetContents;
        })
        .then(updatedContents => {
          return fs.writeFileAsync(testPath, updatedContents);
        });
    });
};

module.exports = {
  mergeTests
};
