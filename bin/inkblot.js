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

var async = require('async');
var util = require('util');
var path = require('path');

var glob = require('glob');

var unit = require('./unit.js');

// *Globals*
var tabs = '\t';
var spaces = '  ';

// Inkblot Object
// ==============
var inkblot = module.exports = function(options) {
	this.options = _.defaults((options || {}), {
		// Inkblot Defaults
		// ----------------
		searchString: '// t:',
		indentUsing: 'spaces',

		out: './test'

	}, this.options);

	this.indentation = (this.options.indentUsing === 'tabs') ? tabs : spaces;

};

_.extend(inkblot.prototype, {
	// Load Function
	// -------------
	// Loads files based on glob patterns passed as arguments. If no 
	// file can be loaded, it throws an error. If a file IS loaded, 
	// it runs through the file looking for inkblot comments. If it 
	// finds any, it calls the callback function to handle them.
	load: function(filenames, cb) {
		if(!_.isFunction(cb)) throw 'Must supply a callback to \'search\'.';
		if(!Array.isArray(filenames)) filenames = [filenames];

		var i;
		for(i = filenames.length; i--; ) {

			glob( filenames[i], function(err, files) {
				if(err) {
					throw err;
				}
				// If any matches are found, parse them for 
				// inkblot comments.
				var filename;
				var j;
				for(j = files.length; j--; ) {
					filename = files[j];
					process.stdout.write('[ ' + filename + ' ]\n');

					fs.readFile(filename, function(err, data) {
						data = data.toString('utf8');
						if(data.indexOf(this.options.searchString) === -1) {
							console.log('No inkblot comments found in %s', filename);
							return;
						}

						cb.call(this, filename, data);

					}.bind(this));
				}

			}.bind(this));
		}
	},

	// Compile Function 
	// ----------------
	compile: function(filenames) {
		this.load(filenames, function(filename, data) {
			var line, start, end;
			var count = 0;

			var tests = [];
			var testObj;

			var base, ext;
			// The variable to hold the `.spec` file stream to be 
			// written once compilation is done.
			var stream = '';
			
			// Find the comments in the file.
			for(line = ''; (start = data.indexOf(this.options.searchString)) !== -1; count++) {
				end = data.indexOf('\n', start) + 1;
				line = data.slice(start, end);
				// Remove the line from the data stream so that you 
				// don't cycle over the same comment twice.
				data = data.replace(line, "");

				// Get workable comment that we can perform 
				// operations on and modify.
				line = line.slice(this.options.searchString.length + 1, -1);

				tests.push(line);

			}

			// Once we have the comment in a workable form, it is 
			// time to actually generate the test spec file. We 
			// do this by piping the commands successively into 
			// nested functions, each writing a piece of the spec 
			// to the stream, which will form a neat, nested 
			// specification once written.
			// console.log(tests);

			testObj = this.generateJSON(tests);

			// Write the file to a new spec file.
			ext = path.extname(filename);
			base = path.basename(filename, ext);
			
			filename = path.join(this.options.out, base + '.spec' + ext);

			fs.writeFile(filename, stream, function(err) {
				if(err) {
					throw err;
				}
				process.stdout.write(' ==> ' + filename + '\n');
			});

		}.bind(this));
	},

	// Generate JSON Function
	// ----------------------
	// Interprets the comments and creates a nested JSON object with 
	// some metadata about each test. 
	// Creates an object set up as a tree, with 'children' nodes to 
	// facilitate nesting. After the object has been created, it will 
	// be run through the stream writing function to actually 
	// generate the stream to write to the spec file.

	// TODO: refactor to improve DRY coding techniques. I feel I could remove about ten lines from this function.
	generateJSON: function(tests) {
		var id;

		var i, j;

		var parent = tests[0];
		var children = [];

		var result = {};
		for(i = 0; i < tests.length; i++) {

			// Test if the current line is a 'parent'. If it is, then 
			// push all children which have accumulated to the 
			// previous parent and set up a new parent to add 
			// children to.
			if(this._getLevel(tests[i]) === 0) {
				
				if(children.length > 0) {
					for(j = 0; j < children.length; j++) {
						children[j] = children[j].slice(this.indentation.length);
					}

					parent.children = this.generateJSON(children);
				}

				// Make a new parent. Default key:value pairs are 
				// `command` and `children`. 'Command' holds the full 
				// string in the line, minus any indentation.
				id = _.uniqueId();

				parent = result[id] = {
					command: tests[i],
					children: null
				};

				children = [];

			}
			// This line has an indentation level higher than the 
			// current indentation level; it is a 'child' element and 
			// we should add it to the list of children to be added.
			else {
				children.push(tests[i]);
			}

		}

		// Push any last children to the result object. This handles 
		// any 'dangling' children that appear last in the list.
		if(children.length > 0) {
			for(j = 0; j < children.length; j++) {
				children[j] = children[j].slice(this.indentation.length);
			}

			parent.children = this.generateJSON(children);
		}

		return result;
	},


	generateTests: function(obj) {

	},

	// Get Indentation Level
	// ---------------------
	// Take lines of comments and determine the indentation level of 
	// each comment. This will determine nesting. Once this is 
	// determined, it will be possible to interpret the sub-commands 
	// of each comment.
	_getLevel: function(line) {
		var level, piece;

		for(level = 0; (piece = line.slice(0, 2)) == this.indentation; level++) {
			line = line.slice(this.indentation.length);
		}

		return level;
	},

	// Clean Comments
	// --------------
	// Removes test comments beginning with `searchString` found in 
	// the file.
	clean: function(filenames) {
		this.load(filenames, function(filename, data) {
			var line, index;
			
			for(line = ''; (index = data.indexOf(this.options.searchString)) !== -1; ) {
				line = data.slice(index, data.indexOf('\n', index) + 1);

				data = data.replace(line, "");
			}

			fs.writeFile(filename, data, function(err) {
				if(err) {
					throw err;
				}
			});

		});
	}

});


