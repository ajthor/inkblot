/* globals describe it beforeEach before after afterEach expect */

// Global variable definitions to accomodate wayward function errors 
// in syntax.
global.describe = function () {};
global.it = function () {};

global.before = function () {};
global.after = function () {};
global.beforeEach = function () {};
global.afterEach = function () {};



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

var chalk = require('chalk');

var languages = require('./languages.json');

var beautify = require('js-beautify').js_beautify;

// Inkblot Object
// ==============
// The main object in the file. It does not do much on its own 
// without calling the main function, `run` on some file name.
var inkblot = module.exports = function (options) {
	this.options = _.defaults((options || {}), {
		// Inkblot Defaults
		// ----------------
		autoReplace: false,
		autoRemove: true,

		createJSON: false,

		enablePrompts: true,

		silent: false,

		out: './test'

	}, this.options);
};

_.extend(inkblot.prototype, require('./utils/scaffold.js'));
_.extend(inkblot.prototype, require('./utils/splice.js'));
_.extend(inkblot.prototype, require('./utils/generate.js'));



// Inkblot Prototype
// -----------------
_.extend(inkblot.prototype, {

	// Log Function
	// ------------
	// Helper function to pretty-print to the console.
	log: function (message) {
		if (this.options.silent) {
			return this;
		}
		var start, end;
		var ibLog = '['+chalk.grey('inkblot')+']';
		var args = Array.prototype.slice.call(arguments);
		args.unshift(ibLog);

		var i, match;
		for (i = args.length; i--; ) {
			if ((match = /\'(.+?)\'/.exec(args[i])) !== null) {
				args[i] = '[ '+chalk.cyan(match[1])+' ]';
			}
		}

		console.log.apply(console, args);
		return this;
	},

	// Run Function
	// ------------
	// The entry-point into the program. One file at a time, it calls 
	// `compile` on each file asynchronously.
	run: function (globs) {
		if (!Array.isArray(globs)) {
			globs = [globs];
		}
		async.eachSeries(globs, function (item, next) {
			item = path.resolve(item);

			// Make sure the file being loaded is not a '.spec'. 
			// If it is, quit and move on to the next file.
			if (item.indexOf('.spec') !== -1) {
				next(new Error('Cannot run inkblot on a spec file: ' + item));
			}

			fs.readFile(item, function (err, data) {
				if (err) {
					next(err);
				}

				async.waterfall([
					function (callback) {
						var ext = path.extname(item);
						var base = path.basename(item, ext);

						callback(null, {
							cwd: process.cwd(),
							path: item,
							ext: ext,
							base: base,
							name: path.basename(item),
							spec: path.join(this.options.out, base + '.spec' + ext),
							_contents: data
						});
					}.bind(this),

					this.compile.bind(this)

				],
				function (err, result) {
					if (err) {
						this.log(err);
					}

					next(null);

				}.bind(this));
			}.bind(this));

		}.bind(this),
		function (err) {
			if (err) {
				throw err;
			}
			this.log(chalk.green('DONE'));
		}.bind(this));
	},

	// Compile Function
	// ----------------
	// Called from `run` function, this function asynchronously 
	// compiles the comments in a file into a test spec file. 
	// Basically, it opens the file, finds the comments, parses them 
	// into a spec, and writes them to disk. If there is a problem, 
	// it will not write the file.
	compile: function (file, done) {
		var startTime;

		async.waterfall([
			function greet(callback) {
				this.log('parsing', '\'' + file.name + '\'');
				startTime = new Date().getTime();
				callback(null);
			}.bind(this),

			function resolveLanguage(callback) {
				// Figure out which language this file is based on 
				// the extension. If there is an entry in the 
				// `languages.json` file, then load the symbol lookup
				// info for this file.
				var ext;
				for (ext in languages) {
					if (file.ext === ext) {
						file.type = languages[ext].name;
						file.symbol = languages[ext].symbol;
					}
				}
				if (typeof file.symbol === 'undefined' || file.symbol === '') {
					return callback(new Error('Cannot run inkblot on file: ' + file.name));
				}

				this.log('file type resolved to', file.type);

				callback(null, file);
			}.bind(this),

			this.scaffold.bind(this),

			this.splice.bind(this),

			this.generate.bind(this)

		],
		// Save File
		// ---------
		// Save the file to the output directory if no errors 
		// occurred along the way.
		function (err, result) {
			if (err) {
				done(err);
			}
			else {
				result = beautify(result, {indent_size: 4});

				fs.writeFile(file.spec, result, function (err) {
					if (err) {
						done(err);
					}
					else {
						this.log(chalk.green('compiled'), 'in', chalk.magenta(new Date().getTime() - startTime, 'ms'));
						done(null);
					}
				}.bind(this));
			}
		}.bind(this));
	}

});


