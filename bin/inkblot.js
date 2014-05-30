'use strict';

// Inkblot
// =======
// Node.js program to generate unit tests from inline comments. 
// Let's face it, writing unit tests can suck. Inkblot makes things 
// easy by providing an inline scripting 'language' for generating 
// those pesky unit tests. The need for switching from one file to 
// another to manage your unit tests is a thing of the past now that 
// you can write your tests alongside your functions and compile them 
// whenever you want!

var fs = require('fs');

// Require underscore.
var _ = require('underscore');

// Require async.
var async = require('async');
var path = require('path');

var glob = require('glob');
var beautify = require('js-beautify').js_beautify;

// 'It' Function
// -------------
// Global variable definition to accomodate wayward 'it' function 
// errors in syntax.
global.it = function() {};


// Util Functions Used in Templates
// --------------------------------
var test = require('../lib/utils.js').test;

// Inkblot Object
// ==============
var inkblot = module.exports = function (options) {
	this.options = _.defaults((options || {}), {
		// Inkblot Defaults
		// ----------------
		searchString: '// describe',
		out: './test'

	}, this.options);

};

_.extend(inkblot.prototype, {

	// Run Function
	// ------------
	// The entry-point into the program.
	run: function (files) {
		if (!Array.isArray(files)) files = [files];
		async.each(files, this.compile.bind(this), function (err) {
			if (err) {
				throw err;
			}
			console.log('Task completed.');
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
		var searchString = this.options.searchString;
		var ext, base, specFile;

		ext = path.extname(file);
		base = path.basename(file, ext);
		specFile = path.join(this.options.out, base + '.spec' + ext);

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
						callback(new Error('File does not exist.'));
					}

					callback(null);
				});
			},

			// Load module.
			function loadModule(callback) {
				var module = null;
				var obj;

				try {
					module = require(file);
					obj = this.scaffold(base, module);
				}
				catch(e) {
					console.warn('WARN: [ %s ] is not a loadable node module.', file);
					if (e) {
						console.error('Error: ', e.stack);
					}
				}
				finally {
					callback(null, obj);
				}
			}.bind(this),

			// Load File
			// ---------
			// Load the file into the stream and check to see if 
			// there are any test comments in it. 
			// If not, no need to continue.
			function loadFile(obj, callback) {
				fs.readFile(file, {encoding: 'utf8'}, function (err, data) {
					if (data.indexOf(searchString) === -1) {
						callback(new Error('No inkblot comments in file: ' + file), data);
					}

					callback(null, obj, data);
				}.bind(this));

			}.bind(this),

			// Once we have a scaffold of the object we are going to 
			// put into the spec file, we need to make sure we don't 
			// overwrite the tests written by the user in the spec.
			// To do this, we are going to take the following steps:
			
			// 1. find test comments in the source file
			// 2. splice those tests into the object we have created
			// 3. for each item in the object, we are going to splice 
			// those tests into the spec file under the appropriate 
			// 'describe' headings, checking to make sure the 
			// descriptions do not clash for individual tests
			// 4. write the spec to file

			this.spliceComments.bind(this),


			function (obj, data, callback) {
				callback(null, obj);
			}.bind(this),

			this.generate.bind(this),

			// Prepend Headers
			// ---------------
			// Prepend all headers necessary for the spec to work, 
			// i.e. chai assertion libraries, module files, etc.
			function appendHeaders(stream, callback) {
				stream = 'var ' + base + ' = require(\'' + path.resolve(specFile, file) + '\');\n\n\n\n' + stream;

				stream = 'var chai = require(\'chai\'),\n \
					\texpect = chai.expect,\n \
					\tassert = chai.assert,\n \
					\tshould = chai.should();\n\n' + stream;

				stream = '// global describe, it, beforeEach, expect, should, assert, require\n\n' + stream;

				callback(null, stream);
			}

		],
		// Save File
		// ---------
		// Convert the file name into a `.spec` version and save it 
		// to the output directory if no errors occurred 
		// along the way.
		function (err, result) {
			if (err) {
				console.log(err.message);
			}
			else {
				result = beautify(result, {indent_size: 4});

				fs.writeFile(specFile, result, function (err) {
					if (err) {
						throw err;
					}
					process.stdout.write('Compiled: [ ' + specFile + ' ]\n');
				});
			}
		});
	},

	// Load Template Function (Memoized)
	// ---------------------------------
	// In order to avoid loading the same template time after time, I 
	// will memoize the output in order to load each template 
	// only once.
	loadTemplate: async.memoize(function (obj, callback) {
		var file = path.resolve(path.join('../inkblot/lib/templates', obj.template + '.js'));

		fs.readFile(file, 'utf8', function (err, data) {
			if (err) {
				callback(err);
			}
			else {
				callback(null, data);
			}
		});
	}),

	// Scaffold Function
	// -----------------
	// Using the output of a module, the `scaffold` function 
	// traverses the object and generates a suite of unit tests to 
	// cover the module. If the objects have prototypes, it will 
	// create tests to cover the prototypes as well.
	scaffold: function (key, obj) {
		var result = [];
		var children = [];
		var protoChildren = [];

		var item;

		// Based on the type of 'obj' passed to the scaffold 
		// function, we will create different unit tests depending on 
		// that type. Objects and functions will require nested tests 
		// whereas primitives will require fewer. Perhaps only 
		// existence checks.
		switch (typeof obj) {
			case 'object':
			case 'function':

				// children.push(new test({
				// 	template: 'beforeEach',
				// 	variables: {
				// 		name: key
				// 	}
				// }));

				// If there are any static functions or properties on 
				// this object or function, then create unit tests 
				// for them.
				for (item in obj) {
					if (obj.hasOwnProperty(item)) {
						children = children.concat(this.scaffold(item, obj[item]));
					}
				}

				// If the function or object has a prototype that 
				// 'hasOwnProperties', then create unit tests for 
				// those properties.
				for (item in obj.prototype) {
					if (obj.prototype.hasOwnProperty(item)) {
						protoChildren = protoChildren.concat(this.scaffold(item, obj[item]));
					}
				}
				if (protoChildren.length) {
					children.push(new test({
						raw: key + '.prototype',
						variables: {
							name: key + 'Proto'
						}
					}, protoChildren));
				}

				// Once the children have been generated, we can 
				// create the test that will be the parent of all of 
				// these children, which is essentially the test for 
				// the object passed to the `scaffold` function. 
				// Using the `key` argument, or, if none is provided, 
				// a unique identifier, generate some unit test.
				result.push(new test({
					raw: typeof obj + ' ' + key,
					variables: {
						name: (key || _.uniqueId(typeof obj))
					}
				}, children));
				break;
			// If the 'obj' passed to the scaffolding function is 
			// not either an object nor a function, it means it is 
			// another primitive data type and we simply need to 
			// generate some test for it. Perhaps just to check if it 
			// exists.
			default:
				result.push(new test({
					raw: key,
					variables: {
						name: (key || _.uniqueId(typeof obj))
					}
				}, []));
				break;
		}

		return result;
	},

	searchObject: function (needle, haystack) {
		var result = null;
		for (var i in haystack) {
			if(haystack[i].raw === needle) {
				// console.log('>>> MATCH <<<');
				result = haystack[i];
			}
			else if(haystack[i].children.length) {
				result = this.searchObject(needle, haystack[i].children);
			}

			if(result) {
				return result;
			}
		}

		return result;
	},

	getBlock: function (index, block) {
		var end, start = block.indexOf('{', index) + 1;
		var blockCount = 1;

		var i;

		for (i = start; i < block.length; i++) {
			if (block[i] === '{') {
				blockCount++;
			}
			else if (block[i] === '}') {
				blockCount--;
				if(blockCount === 0) {
					// end = block.indexOf('\n', i);
					end = i;
					return block.slice(start, end).trim();
				}
			}
		}
	},

	spliceComments: function (obj, data, callback) {
		var rxDescribe = new RegExp('\s*\/\/ (describe (.+))\n', 'g');
		var rxIt = new RegExp('it\\((?:\'|")(.*)(?:\'|")', 'g');

		var match;
		var target;
		var ref, code;

		var block, itBlock;
		var blockMatch;

		var child;

		while ((match = rxDescribe.exec(data)) !== null) {
			// If the describe block already exists in the spec file, 
			// then we can assume that the user intended to add the 
			// unit test to that block. So, add the spec to the block 
			// as a new child test.
			ref = this.searchObject(match[2], obj);

			block = data.slice(match.index + match[0].length, data.indexOf('// end', match.index));

			// If nothing is found, we can assume that the test is 
			// something new that we aren't expecting to be tested.
			if (!ref) {
				obj.push(new test({
					raw: match[1],
					code: block
				}));
			}
			// Otherwise, it has been found. In this case, just 
			// append the 'it' blocks to the 'describe' block if they 
			// don't exist already.
			else {

				while ((blockMatch = rxIt.exec(block)) !== null) {
					itBlock = this.getBlock(blockMatch.index, blockMatch.input);

					target = null;

					for (child in ref.children) {
						if (ref.children[child].raw === blockMatch[1]) {
							target = ref.children[child];
						}
					}

					if (target) {
						target.code = itBlock;
					}
					else {
						ref.children.push(new test({
							template: 'it',
							raw: blockMatch[1],
							code: itBlock
						}));
					}
				}

			}

		}

		callback(null, obj, data);
	},

	// Generate
	// --------
	// Generates the actual text which will go inside the spec file. 
	// It loads the templates from file and populates them with 
	// values from each item in the object passed to it.
	generate: function (obj, callback) {
		var stream = '';

		if (!Array.isArray(obj)) {
			callback(null, '');
		}
		else {
			async.eachSeries(obj, function (item, next) {
				var t;
				var file = path.resolve(path.join('../inkblot/lib/templates', item.template + '.js'));

				// Read the template and parse the object into the 
				// template to create a test.
				fs.readFile(file, 'utf8', function (err, data) {
					if (err) {
						console.log(err);
					}

					// If the node has children, meaning there are some 
					// items which should go inside this one, then 
					// recursively call generate on the object using 
					// async function calls.
					async.waterfall([
						function (callback) {
							callback(null, item.children);
						},

						this.generate.bind(this)
					], 
					function (err, result) {
						if (err) {
							console.log(err);
						}

						item.children = result;

						t = _.template(data, item);

						// Change here.
						stream += t;

						next(null);
					});
				}.bind(this));

			}.bind(this), 
			function (err) {
				if (err) {
					console.log(err);
				}
				callback(null, stream);
			});
		}
	}

});


