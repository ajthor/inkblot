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

// *Globals*
var tabs = '\t';
var spaces = '  ';

// Test Functions
// --------------
var describe = function(description, data, cb) {
	 
}

var it = function(description, data, cb) {

}

// Inkblot Object
// ==============
var inkblot = module.exports = function(options) {
	this.options = _.defaults((options || {}), {
		// Inkblot Defaults
		// ----------------
		searchString: '//t',
		indentUsing: 'spaces',
		templates: [
			'describe', 
			'it', 
			'module', 
			'function', 
			'object'
		]

	}, this.options);

};

_.extend(inkblot.prototype, {
	// Load Function
	// -------------
	// Loads files based on glob patterns passed as arguments. If no 
	// file can be loaded, it throws an error. If a file IS loaded, 
	// it runs through the file looking for inkblot comments. If it 
	// finds any, it calls the callback function to handle them.
	load: function(filenames, cb, context) {
		if(!_.isFunction(cb)) throw 'Must supply a callback to \'search\'.';
		if(!Array.isArray(filenames)) filenames = [filenames];

		var i;
		for(i = filenames.length; i--; ) {

			glob( filenames[i], function(err, matches) {
				if(err) {
					throw err;
				}
				// If any matches are found, parse them for 
				// inkblot comments.
				var j;
				for(j = matches.length; j--; ) {
					process.stdout.write('[ ' + matches[j] + ' ]\n');
					this.parse(matches[j], cb, context);
				}

			}.bind(this));
		}
	},

	parse: function(filename, cb, context) {
		if(!_.isFunction(cb)) throw 'Must supply a callback to \'parse\'.';
		if(typeof context === 'undefined' || context === null) {
			context = this;
		}

		fs.readFile(filename, function(err, data) {
			data = data.toString('utf8');
			if(data.indexOf(this.options.searchString) === -1) {
				console.log('No inkblot comments found in %s', filename);
				return;
			}

			cb.call(context, filename, data);

		}.bind(this));
	},

	// Compile Function 
	// ----------------
	compile: function(filenames) {
		this.load(filenames, function(filename, data) {
			var line, start, end;
			var level, indentation, piece;
			
			// Find the comments in the file.
			for(line = ''; (start = data.indexOf(this.options.searchString)) !== -1; ) {
				end = data.indexOf('\n', start) + 1;

				line = data.slice(start, end);
				line = line.slice(this.options.searchString.length + 1);

				if(line.length > 0) {
					process.stdout.write(line);
				}

				// Remove the line from the data stream so that you 
				// don't cycle over the same comment twice.
				data = data.replace(line, "");

				// Take lines of comments and determine the 
				// indentation level of each comment. This will 
				// determine nesting. Once this is determined, it 
				// will be possible to interpret the sub-commands of 
				// each comment.
				indentation = (this.options.indentUsing === 'tabs') ? tabs : spaces;

				for( level = 0; (piece = line.slice(0, 2)) == indentation; level++) {
					line = line.slice(indentation.length);
				}

				// Once the indentation level is determined, split 
				// the rest of the command into keywords.

			}

		});
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


