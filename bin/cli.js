#!/usr/bin/env node
'use strict';

const meow = require('meow');
const inkblot = require('../src/inkblot.js');

// InkBlot Command-Line Tool
// =========================
// This is the CLI program for InkBlot, the unit test generator.
const usage = `
  Usage: inkblot <glob> [options]

  Options:
    -h, --help                         Show this message.
    -i, --init                         Initialize the project with inkblot.
    -c, --clean                        Clean up source file. Delete test blocks.
    -o <output>, --output="<output>"   Specify an output directory. Default is 'test'.
    --dry                              Dry run. Will not create or modify any files.
`;

const defaultIgnores = [
  '**/node_modules/**',
  '**/bower_components/**',
  'coverage/**',
  '{tmp,temp}/**',
  '**/*.min.js',
  '**/bundle.js',
  '**/gulp*',
  'fixture{-*,}.{js,jsx}',
  'fixture{s,}/**',
  '**/test-*.js',
  '{test,tests,spec,__tests__}/fixture{s,}/**',
  'vendor/**',
  'dist/**'
];

const cli = meow(usage, {
  alias: {
    c: 'clean',
    h: 'help',
    o: 'output'
  },
  default: {
    dry: false,
    clean: false,
    ignore: defaultIgnores,
    o: 'test'
  }
});

const globs = cli.input;
const options = cli.flags;

// C:\> Run program
if (options.init) {
  inkblot.init(options);
} else {
  inkblot.mergeTests(globs, options);
}
