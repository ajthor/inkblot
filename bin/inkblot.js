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

// Inkblot Object
// ==============
var inkblot = module.exports = function(options) {
	this.options = _.defaults((options || {}), {
		// Inkblot Defaults
		// ----------------
		searchString: '//t',
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

			console.log(filenames);

			glob( filenames[i], function(err, matches) {
				if(err !== null) {
					throw err;
				}
				// If any matches are found, parse them for 
				// inkblot comments.
				var j;
				for(j = matches.length; j--; ) {
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
			var line, index;

			for(line = ''; (index = data.indexOf(this.options.searchString)) !== -1; ) {
				line = data.slice(index, data.indexOf('\n', index));

				if(line.length > 0) {
					console.log(line);
				}
			}
		});
	},

	// Clean Comments
	// --------------
	// Removes test comments beginning with `searchString` found in 
	// the file.
	clean: function(filenames) {

	}

});


