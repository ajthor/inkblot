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
var beautify = require('js-beautify').js_beautify;

// Inkblot Object
// ==============
var inkblot = module.exports = function(options) {
	this.options = _.defaults((options || {}), {
		// Inkblot Defaults
		// ----------------
		searchString: '// t:',
		out: './test'

	}, this.options);

};

_.extend(inkblot.prototype, {

	// Run Function
	// ------------
	// The entry-point into the program.
	run: function(files) {
		if(!Array.isArray(files)) files = [files];
		async.each(files, this.compile.bind(this), function(err) {
			if(err) {
				console.log(err.message);
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
	compile: function(file, done) {
		var searchString = this.options.searchString;
		var destination = this.options.out;

		async.waterfall([
			// Load File
			// ---------
			// Load the file into the stream and check to see if 
			// there are any test comments in it. 
			// If not, no need to continue.
			function load(callback) {
				process.stdout.write('[ ' + file + ' ]\n');

				if(file.indexOf('.spec') !== -1) {
					return callback(new Error('Cannot run inkblot on a spec file: ' + file), null);
				}
		
				fs.readFile(file, {encoding: 'utf8'}, function(err, data) {
					if(data.indexOf(searchString) === -1) {
						callback(new Error('No inkblot comments in file: ' + file), data);
					}

					callback(null, data);
				});

			},
			
			// Parse Comments
			// --------------
			// Convert the comments to an array of workable commands.
			this.findComments.bind(this),
			
			// Create Spec
			// -----------
			// Using another async function call, create a spec from 
			// the command object.
			this.createSpec.bind(this)
		],
		// Save File
		// ---------
		// Convert the file name into a `.spec` version and save it 
		// to the output directory if no errors occurred 
		// along the way.
		function(err, result) {
			var ext, base;

			if(err) {
				console.log(err.message);
			}
			else {
				ext = path.extname(file);
				base = path.basename(file, ext);
				file = path.join(destination, base + '.spec' + ext);

				result = beautify(result, {indent_size: 4});

				fs.writeFile(file, result, function(err) {
					if(err) throw err;
					process.stdout.write('Compiled: [ ' + file + ' ]\n');
				});
			}
		});
	},

	findComments: function(data, callback) {
		var comments = [];
		var line, start, end;

		for(line = ''; (start = data.indexOf(this.options.searchString)) !== -1; ) {
			end = data.indexOf('\n', start) + 1;
			line = data.slice(start, end);
			// Remove the line from the data stream so that you 
			// don't cycle over the same comment twice.
			data = data.replace(line, "");
			// Get workable comment that we can perform 
			// operations on and modify.
			line = line.slice(this.options.searchString.length + 1, -1);

			comments.push(line);
		}

		return callback(null, comments);
	},

	// Create Spec Function
	// --------------------
	// 
	createSpec: function(comments, callback) {

		var stream = '';

		var obj = this.makeObject(comments);
		// console.log(obj);

		// If current level = next level : siblings
		// If current level > next level : not a child
		// If current level < next level : child

		callback(null, stream);
	},

	// Make Object Function
	// --------------------
	makeObject: function(comments) {
		if(comments.length == 0) return null;
		var i, j;

		var currentLevel = this.indentLevel(comments[0]);
		var collected = [];

		var result = {};

		var id;

		for(i = 0; i < comments.length; i++) {
			console.log("i: %d - %s", i, comments[i]);
			collected = [];

			id = _.uniqueId();

			result[id] = {
				desc: comments[i],
				children: null
			}

			for(j = i + 1; j < comments.length; j++) {
				if(currentLevel >= this.indentLevel(comments[j]))
					break;

				console.log("  j: %d", j);
				collected.push( comments.splice(j, 1) );

				console.log(comments);
			}

			result[id].children = this.makeObject(collected);

		}

		return result;
	},
	
	// Get Indentation Level
	// ---------------------
	// Take lines of comments and determine the indentation level of 
	// each comment. This will determine nesting.
	indentLevel: function(comment) {
		var level, piece;

		for(level = 0; (piece = comment.slice(0, 2)) == '  '; level++) {
			comment = comment.slice(2);
		}

		return level;
	}

});


