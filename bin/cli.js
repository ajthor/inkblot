#!/usr/bin/env node

'use strict';

const fs = require('fs');
const meow = require('meow');

const inkblot = require('../lib/inkblot.js');

// InkBlot Command-Line Tool
// =========================
// This is the CLI program for InkBlot, the unit test generator.
const usage = `
  Usage: inkblot <glob> [options]

  Options:
    -i, --init                         Initialize the project with inkblot.
    -o <output>, --output="<output>"   Specify an output directory. Default is 'test'.

`;

const cli = meow(usage, {
  alias: {
    o: 'output'
  },
  default: {
    o: 'test'
  }
});

const globs = cli.input;
const options = cli.flags;

// C:\> Run program
if (options.init) {
  const init = require('../lib/init.js');
  init.setup(options);
} else {
  inkblot.parseFiles(globs, options);
}
