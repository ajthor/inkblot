// Inkblot
// =======
// Node.js program to generate unit tests from inline comments. 
// Let's face it, writing unit tests can suck. Inkblot makes things 
// easier by providing an inline 'interface' for wiring unit tests 
// into spec files. It generates a basic scaffolding of tests for 
// javascript modules and lets you know how comprehensive your tests 
// should be. It covers everything output by the module's `exports` 
// object and then wires in tests you have written in inline test 
// blocks into the spec file.

'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('underscore');
var async = require('async');

var beautify = require('js-beautify').js_beautify;

// Global Functions
// ----------------
// Global variable definitions to accomodate wayward function errors 
// in syntax.
global.describe = function () {};

global.it = function () {};

global.beforeEach = function () {};



// Inkblot Object
// ==============
// The main object in the file. It does not do much on its own 
// without calling the main function, `run` on some file name.
var inkblot = module.exports = function (options) {
	this.options = _.defaults((options || {}), {
		// Inkblot Defaults
		// ----------------
		comment: '//',
		out: './test'

	}, this.options);
};

_.extend(inkblot.prototype, require('./utils/scaffold.js'));
_.extend(inkblot.prototype, require('./utils/splice.js'));
_.extend(inkblot.prototype, require('./utils/generate.js'));

// Inkblot Prototype
// -----------------
_.extend(inkblot.prototype, {

	// Run Function
	// ------------
	// The entry-point into the program. Limit 3 files at once, it 
	// calls `compile` on each file asynchronously.
	run: function (files) {
		if (!Array.isArray(files)) {
			files = [files];
		}
		async.eachLimit(files, 3, this.compile.bind(this), function (err) {
			if (err) {
				throw err;
			}
			console.log('Done.');
		});
	},

	// Compile Function
	// ----------------
	// Called from `run` function, this function asynchronously 
	// compiles the comments in a file into a test spec file. 
	// Basically, it opens the file, finds the comments, parses them 
	// into a spec, and writes them to disk. If there is a problem, 
	// it will not write the file.
	compile: function (file, done) {
		async.waterfall([
			// Resolve the file name.
			function fileName(callback) {
				process.stdout.write('[ ' + file + ' ]\n');
				file = path.resolve(file);

				// Make sure the file being loaded is not a '.spec'. 
				// If it is, quit and move on to the next file.
				if (file.indexOf('.spec') !== -1) {
					callback(new Error('Cannot run inkblot on a spec file: ' + file), null);
				}

				fs.exists(file, function (exists) {
					if (!exists) {
						callback(new Error('File does not exist.'), null);
					}

					callback(null, file);
				});
			},

			this.scaffold.bind(this),

			this.splice.bind(this),

			this.generate.bind(this)

		],
		// Save File
		// ---------
		// Save the file to the output directory if no errors 
		// occurred along the way.
		function (err, result) {
			var ext, base, specFile;

			if (err) {
				console.log(err.message);
			}
			else {

				ext = path.extname(file);
				base = path.basename(file, ext);
				specFile = path.join(this.options.out, base + '.spec' + ext);

				result = beautify(result, {indent_size: 4});

				fs.writeFile(specFile, result, function (err) {
					if (err) {
						throw err;
					}
					process.stdout.write('compiled: [ ' + specFile + ' ]\n');
					done(null);
				});
			}
		}.bind(this));
	}

});


