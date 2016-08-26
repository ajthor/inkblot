'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const globby = require('globby');
const Promise = require('bluebird');

Promise.promisifyAll(fs);

//
// Inkblot Tool
// =======================================
// The Inkblot tool takes files and maps comment blocks inside those files to
// comment blocks inside test files. These comment blocks are defined using the
// keywords `TEST` and `END`. Each block can contain a label, specified in
// curly braces, immediately following the `TEST` declaration. The program
// searches for a test file using the name of the source file currently being
// parsed and maps the test blocks 1:1 to the test file.
// This cuts down on development time while writing initial code and allows
// blocks of tests to be written alongside the functions that they describe.
// The test library is agnostic of religion, and allows any testing framework
// to be used.

// Regex for finding test blocks. Regex-fu.
const regexBlock = /^(?:\/\/\s*?TEST\s*?{([\s\S]+?)})\s*?\n([\s\S]+?)(?=\/\/\s*?END)/gm;
// ^(?:\/\/\s*?TEST\s*? - Find all double-slash comments that precede the word `TEST`.
//   {([\s\S]+?)}) - Capture the 'label' of the test block.
//   \s*?\n - Ensure that a newline exists after this declaration.
// ([\s\S]+?) - Capture the contents of the test block.
// (?=\/\/\s*?END) - And ensure that the block is enclosed with an `END` keyword.

// The matchRegex function finds all test blocks in the source file and returns
// them as an array.
const matchRegex = (contents, regex) => {
  const matches = [];
  let match;
  do {
    match = regex.exec(contents);
    if (match) {
      matches.push(match);
    }
  } while (match);
  return matches;
};

// We need to create a 'working' update of the file to save to the target file.
// This function returns an array of all updates we will make to the
// target file.
const softMerge = (sourceBlocks, targetBlocks) => {
  const updates = [];
  // Cycle through each block found in the source file and match it to the
  // blocks found in the target (test) file.
  sourceBlocks.forEach(sourceBlock => {
    const update = {};
    update.name = sourceBlock[1].trim();
    update.diff = sourceBlock[0];

    _.forEach(targetBlocks, targetBlock => {
      // Match the blocks using the name of the block.
      if (update.name === targetBlock[1].trim()) {
        update.orig = targetBlock[0];
        // End the loop if we find a block.
        return false;
      }
    });

    // Add the update to the array. This also catches any new blocks which are
    // not already in the test file.
    updates.push(update);
  });

  return updates;
};

// Function exposed to the CLI as the point of entry into the program. Accepts
// globs and parses the files one-by-one.
const mergeTests = (globs, options) => {
  // For when no globs are given.
  if (globs.length === 0) {
    // Default to matching all javascript and .jsx files in the folder.
    globs = ['**/*.{js, jsx}'];
  }

  // Using promises, we will open each file individually and create tests for
  // that file. Since each file is uniquely named based on its filename, we
  // don't have to worry about two files overlapping.
  return Promise.resolve(globby(globs, {ignore: options.ignore}))
    .each(file => {
      // Get the name of the test file which corresponds with the source file.
      const testDir = `${path.resolve(path.dirname(__dirname), 'test')}`;
      const testPath = `${testDir}/test_${path.parse(file).name}.js`;

      // Get all of the source blocks from the source file.
      const sourceBlocks = fs.readFileAsync(file, 'utf8')
        .then(contents => matchRegex(contents, regexBlock));

      // Get the target file and possibly create it if it doesn't already exist.
      const targetFile = fs.accessAsync(file, fs.F_OK)
        // If we cannot access the file because it doesn't exist, create the
        // file and add 'boilerplate'.
        .catch(() => fs.appendFileAsync(file, `'use strict';\nimport test from 'ava';\n`))
        .then(() => fs.readFileAsync(testPath, 'utf8'));

      const targetBlocks = targetFile.then(contents => matchRegex(contents, regexBlock));

      return Promise.join(sourceBlocks, targetBlocks, (sourceBlocks, targetBlocks) => {
        // Perform soft update of all blocks. This will return an array of
        // all updates to be made to the target file.
        return softMerge(sourceBlocks, targetBlocks);
      })
        // Then we need to perform a 'hard' merge of the tests found in the
        // source file and write the newly updated test file to disk.
        .then(updates => {
          let targetContents = targetFile.value();
          // Cycle through the updates one-by-one and replace the test file's
          // code with the code found in the source file, matching using the
          // identifier wrapped in curly braces.
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
