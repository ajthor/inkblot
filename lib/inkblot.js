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

const compileBlocks = blocks => {
  let result = '';
  blocks.forEach(block => result += block[1] + '\n\n');
  return result;
};

// I think what i have to do is take the blocks from the source files and try to
// 'soft' merge them into the test file. Once I do that, I will have updated all
// of the tests that need updating, but I'll have deleted all of the tests that
// don't. So then, once I have the updated tests,
const softMerge = (source, target) => {
  let compiledSource = compileBlocks(source);
  let compiledTarget = compileBlocks(target);
  const patch = diff.structuredPatch('target', 'source', compiledTarget, compiledSource);
  patch.hunks.forEach(hunk => {

  });
};

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
