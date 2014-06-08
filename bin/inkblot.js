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
// describe inkblotJs function
	it('should have default options', function () {
		expect(inkblotJs.options).to.exist;
		expect(inkblotJs.options.autoReplace).to.equal(true);
		expect(inkblotJs.options.autoRemove).to.equal(false);
		expect(inkblotJs.options.enablePrompts).to.equal(false);
		expect(inkblotJs.options.silent).to.equal(true);
	});
// end
var inkblot = module.exports = function (options) {
	this.options = _.defaults((options || {}), {
		// Inkblot Defaults
		// ----------------
		autoReplace: true,
		autoRemove: false,

		createJSON: false,

		enablePrompts: false,

		silent: false,

		comment: '//',
		out: './test'

	}, this.options);
};

_.extend(inkblot.prototype, require('./utils/scaffold.js'));
_.extend(inkblot.prototype, require('./utils/splice.js'));
_.extend(inkblot.prototype, require('./utils/generate.js'));

// describe log

	it('should output nothing if the \'silent\' option is passed', function () {});

// end

// describe compile
	it('should fail if passed a path', function () {
		expect(function () {
			
			compile('/some/path.js', function(err) {
				if (err) {
					throw err;
				}
			});

		}).to.throw(Error);
	});

	it('should fail if passed a Buffer', function () {
		expect(function () {
			
			compile(new Buffer('Hello, world!'), function(err) {
				if (err) {
					throw err;
				}
			});

		}).to.throw(Error);
	});
// end

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
		var ibLog = '['+chalk.green('inkblot')+']';
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
			this.log('load', '\'' + item + '\'');
			item = path.resolve(item);

			// Make sure the file being loaded is not a '.spec'. 
			// If it is, quit and move on to the next file.
			if (item.indexOf('.spec') !== -1) {
				next(new Error('Cannot run inkblot on a spec file: ' + item));
			}

			// load file
			// create file object
			// pass to compile function
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
			this.log('Done.');
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
		async.waterfall([
			// Resolve the file name.
			function fileName(callback) {
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
						this.log('compiled:', '\'' + file.spec + '\'');
						done(null);
					}
				}.bind(this));
			}
		}.bind(this));
	}

});


