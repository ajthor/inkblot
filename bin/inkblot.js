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


// Util Functions Used in Templates
// --------------------------------
var utils = require('../lib/utils.js');

// Inkblot Object
// ==============
var inkblot = module.exports = function(options) {
	this.options = _.defaults((options || {}), {
		// Inkblot Defaults
		// ----------------
		searchString: '// test:',
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
			if(err) throw err;
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
		var ext, base, specFile;

		ext = path.extname(file);
		base = path.basename(file, ext);
		specFile = path.join(this.options.out, base + '.spec' + ext);

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
				}.bind(this));

			}.bind(this)

			// this.findComments.bind(this),

			// function(comments, callback) {
			// 	var obj = this.makeObject(comments);

			// 	for(var i in obj)
			// 		console.log(obj[i]);

			// 	callback(null, '');
			// }.bind(this)

		],
		// Save File
		// ---------
		// Convert the file name into a `.spec` version and save it 
		// to the output directory if no errors occurred 
		// along the way.
		function(err, result) {
			if(err) {
				console.log(err.message);
			}
			else {
				result = beautify(result, {indent_size: 4});

				fs.writeFile(specFile, result, function(err) {
					if(err) throw err;
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
	loadTemplate: async.memoize(function(obj, callback) {
		var file = path.resolve(path.join('../inkblot/lib/templates', obj.cmd + '.js'));

		fs.readFile(file, 'utf8', function(err, data) {
			if(err) callback(err);
			else {
				callback(null, data);
			}
		});
	}),
	
	// Find Comments Function
	// ----------------------
	// Convert the comments to an array of workable commands.
	findComments: function(data, module, callback) {
		var comments = [];
		var line, start, end;

		for(line = ''; (start = data.indexOf(this.options.searchString)) !== -1; ) {
			end = data.indexOf('\n', start) + 1;
			line = data.slice(start, end);
			// Remove the line from the data stream so that you 
			// don't cycle over the same comment twice.
			data = data.replace(line, "");

			line = line.slice(this.options.searchString.length + 1, -1);
			comments.push(line);
		}

		callback(null, comments);
	},

	getIndent: function(comment) {
		var level, piece;
		for(level = 0; (piece = comment.slice(0, 2)) == '  '; level++) {
			comment = this.unIndent(comment);
		}
		return level;
	},

	unIndent: function(comment) {
		return comment.slice(2);
	},

	makeObject: function(comments) {
		var obj = [];
		var child, children;
		var id;

		var i;
		for(i = 0; comments.length && (i < comments.length); ) {
			if(this.getIndent(comments[i]) === 0) {
				children = [];

				while(comments[i+1] && (this.getIndent(comments[i+1]) > this.getIndent(comments[i]))) {
					child = comments.splice(i+1, 1)[0];
					child = this.unIndent(child);

					children.push(child);
				}

				if(children.length) {
					children = this.makeObject(children);
				}

				id = _.uniqueId();

				obj.push({
					comment: comments.splice(i, 1)[0],
					children: children
				});
			}
		}

		return obj;
	}

});


