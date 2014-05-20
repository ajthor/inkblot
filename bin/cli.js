#!/usr/bin/env node

'use strict';

var fs = require('fs');

// Require underscore.
var _ = require('underscore');

var async = require('async');
var util = require('util');
var path = require('path');
var inkblot = require('./inkblot.js');

// InkBlot Command-Line Tool
// =========================
// This is the CLI program for InkBlot, the unit test generator.

var usageMsg = 'usage:  inkblot <command> [options]';

// The pre-defined list of commands available to the CLI.
var commandList = [
	'compile',
	'clean'
];

var usage = function() {
	console.log(usageMsg);
}

// Parse Arguments
// ---------------
// Parses all arguments passed to the program. It considers anything 
// which doesn't begin with a hyphen '-' or a double dash '--' a 
// potential glob file name to pass to the parse function. Returns an 
// object with all options parsed and an array of file names.
//t describe parseArgv
//t   should return an object
var parseArgv = function(argv) {
	var i;
	var obj = {
		files: []
	};

	for(i = argv.length; i--; ) {
		if(argv[i].slice(2) == '--') { // Option
			obj[ argv[i].slice(2) ] = true;
		}
		else if(argv[i][0] === '-') { // Flag
		}
		else {
			obj.files.push(argv[i]);
		}
	}

	return obj;
};

// CLI
// ---
// The command-line tool begins here. It is responsible for accepting 
// two major commands: 'compile' and 'clean'. The former is 
// responsible for generating the unit tests into their respective 
// files. The latter is for removing the test comments from the files 
// it looks through.
var i, len;
var argv = process.argv.slice(3);
var command = process.argv[2];

var obj;
var utility;

if(_.contains(commandList, command)) {

	obj = parseArgv(argv);
	utility = new inkblot(obj);
	
	if(command === 'compile') {
		utility.compile(obj.files);
	}
	else if(command === 'clean') {
		utility.clean(obj.files);
	}

}
// If something went wrong, show the usage information and exit with 
// an error signal.
else {
	usage();
	process.exit(1);
}