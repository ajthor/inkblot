'use strict';

const fs = require('fs');
const path = require('path');
const globby = require('globby');
const diff = require('diff');
const Promise = require('bluebird');

Promise.promisifyAll(fs);
// Regex-fu.
const regexSection = /(?:\/\/\sTEST[\r?\n])([\s\S]*?)(?:[\r?\n]\/\/\sEND)/g;
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
    .then(contents => matchRegex(contents, regexSection))
    .each(sections => matchRegex(sections, regexBlock));
};

const getTestBlocks = file => {
  return fs.accessAsync(file, fs.F_OK)
    // Create the file if it doesn't already exist and add 'boilerplate'.
    .catch(() => fs.appendFileAsync(file, `'use strict';\nimport test from 'ava';\n`))
    .then(() => fs.readFileAsync(file, 'utf8'))
    .then(contents => matchRegex(contents, regexBlock));
};
// const getTestBlocks = file => {
//   return fs.accessAsync(file, fs.F_OK)
//     // Create the file if it doesn't already exist and add 'boilerplate'.
//     .catch(() => fs.appendFileAsync(file, `'use strict';\nimport test from 'ava';\n`))
//     .then(() => fs.readFileAsync(file, 'utf8'));
// };

const compileBlocks = blocks => {
  let result = '';
  blocks.forEach(block => result += block[1] + '\n\n');
  return result;
};

// I think what i have to do is take the blocks from the source files and try to
// 'soft' merge them into the test file. Once I do that, I will have updated all
// of the tests that need updating, but I'll have deleted all of the tests that
// don't.

// So I'm deciding I can either take the diff commands ands parse them to update
// the test file, or, ...

// I can cycle over every possible diff and merge them all back in at the end.

// Create NAMED SECTIONS { NAME }
const softMerge = (source, target) => {
  console.log(source);
  console.log(target);
  let compiledSource = compileBlocks(source);
  let compiledTarget = compileBlocks(target);
  const patch = diff.structuredPatch('target', 'source', compiledTarget, compiledSource);
  // const patch = diff.createTwoFilesPatch('target', 'source', compiledTarget, compiledSource);
  console.log(patch);
  patch.hunks.forEach(hunk => {
    console.log(hunk.lines);
  });
};
// const softMerge = (source, target) => {
//   let newTarget = '';
//   source.forEach(block => {
//     const patch = diff.structuredPatch('target', 'source', target, block[1]);
//     newTarget += diff.applyPatch(target, patch) + '\n\n';
//   });
//
//   console.log(newTarget);
// };

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
          return softMerge(sourceBlocks, testBlocks);
        });
    });
};

module.exports = {
  mergeTests
};
