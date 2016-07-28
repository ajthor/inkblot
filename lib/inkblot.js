'use strict';

const fs = require('fs');
const path = require('path');

const globby = require('globby');
const Promise = require('bluebird');

Promise.promisifyAll(fs);

// Create tests asynchronously.
const createTests = ({file, tests}, options) => {
  if (options.dry) {
    return;
  }
  const writeStream = fs.createWriteStreamAsync(file);

  return Promise.join(writeStream, tests, (stream, tests) => {

  });
};

// Parse files for tests using promises.
const parseFiles = (globs, options) => {
  // For when no globs are given.
  if (globs.length === 0) {
    globs = ['**/*.{js, jsx}'];
  }

  return Promise.resolve(globby(globs, {ignore: options.ignore}))
    .each(file => {
      // Resolve the file name.
      file = path.resolve(__dirname, file);
      const {ext, base, dir} = path.parse(file);

      // Create a promise for reading files.
      const files = fs.readFileAsync(file);

      return Promise.join(files, files => {
          // Some stuff here. Get tests from file, etc.
        })
        .catch(err => {

        });
    });
};

module.exports = {
  createTests,
  parseFiles
};
