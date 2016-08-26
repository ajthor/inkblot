'use strict';
import fs from 'fs';
import path from 'path';

import ChildProcess from 'child_process';
import Promise from 'bluebird';
import getStream from 'get-stream';

import tmp from 'tmp';

import test from 'ava';

import inkblot from '../src/inkblot';

Promise.promisifyAll(fs);

test('mergeTests is exposed as an export', t => {
  t.truthy(inkblot, 'inkblot module is imported');
  t.truthy(inkblot.mergeTests, 'has mergeTests function');
});

// Copy the test fixture to a temporary directory and supply the filenames to
// the test context.
test.beforeEach(t => {
  const fixturePath = path.resolve(__dirname, 'fixture/fixture.js');
  const fixtureTestPath = path.resolve(__dirname, 'fixture/test-fixture.js');

  const tempDir = tmp.dirSync({unsafeCleanup: true});
  t.context.tempDir = tempDir;

  const tempFilePath = path.join(tempDir.name, 'fixture.js');
  const tempFile = fs.readFileAsync(fixturePath, 'utf8')
    .then(contents => fs.writeFileAsync(tempFilePath, contents))
    .then(() => tempFilePath);

  const tempTestFilePath = path.join(tempDir.name, 'test/test-fixture.js');
  const tempTestFile = fs.mkdirAsync(path.dirname(tempTestFilePath))
    .then(() => fs.readFileAsync(fixtureTestPath, 'utf8'))
    .then(contents => fs.writeFileAsync(tempTestFilePath, contents))
    .then(() => tempTestFilePath);

  return Promise.join(tempFile, tempTestFile, (tempFile, tempTestFile) => {
    t.context.tempFile = tempFile;
    t.context.tempTestFile = tempTestFile;
  });
});

// TEST { inkblot file manipulation }
test('will not modify anything when --dry mode is on', t => {

});
// END

test.afterEach(t => {
  t.context.tempDir.removeCallback();
});
