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

var util = require('util');
var path = require('path');

var glob = require('glob');
var beautify = require('js-beautify').js_beautify;



// Load Template Function (Memoized)
// ---------------------------------
// In order to avoid loading the same template time after time, I 
// will memoize the output in order to load each template only once.
var loadTemplate = async.memoize(function(obj, callback) {
	var file = path.resolve(path.join('../inkblot/lib/templates', obj.cmd + '.js'));

	fs.readFile(file, 'utf8', function(err, data) {
		if(err) callback(err);
		else {
			callback(null, obj, data);
		}
	});
});

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
	// The create spec function works by asynchronously creating an 
	// object and passing it into the `generate` function. It returns 
	// the result of the generate function to the `compile` function 
	// to save into a spec file.
	createSpec: function(comments, done) {
		async.waterfall([
			// Make Object
			// -----------
			function(callback) {
				var obj = this.makeObject(comments);
				callback(null, obj);
			}.bind(this),

			this.generate
		],
		function(err, result) {
			if(err) console.log(err);
			done(null, result);
		});
	},

	// Generate
	// --------
	// Generates the actual text which will go inside the spec file. 
	// It loads the templates from file and populates them with 
	// values from each item in the object passed to it.
	generate: function(obj, callback) {
		var stream = '';

		async.eachSeries(obj, function(item, next) {
			var t;
			var file = path.resolve(path.join('../inkblot/lib/templates', item.cmd + '.js'));

			fs.readFile(file, 'utf8', function(err, data) {
				if(err) console.log(err);

				async.waterfall([
					// If the node has children, meaning there are 
					// some items which should go inside this one, 
					// then recursively call generate on the object 
					// using async function calls.
					function(callback) {
						if(item.children.length) {

						}
						callback()
					}

				], 
				function(err, result) {
					if(err) console.log(err);
				});

				// Populate the template with values from the object.
				t = _.template(data, item);

				stream += t;

				next(null);
			});

		}, 
		function(err) {
			if(err) console.log(err);
			callback(null, stream);
		});
	},

	// Make Object Function
	// --------------------
	makeObject: function(comments) {
		var id;

		var i, j;

		var parent = comments[0];
		var children = [];

		var result = [];
		for(i = 0; i < comments.length; i++) {

			// Test if the current line is a 'parent'. If it is, then 
			// push all children which have accumulated to the 
			// previous parent and set up a new parent to add 
			// children to.
			if(this.indentLevel(comments[i]) === 0) {

				if(children.length > 0) {
					for(j = 0; j < children.length; j++) {
						children[j] = children[j].slice(2);
					}

					parent.children = this.makeObject(children);
				}

				// Make a new parent. Default key:value pairs are 
				// `command` and `children`. 'Command' holds the full 
				// string in the line, minus any indentation.
				
				// id = _.uniqueId();

				// parent = result[id] = {
				// 	description: comments[i],
				// 	cmd: comments[i].split(' ')[0],
				// 	children: null
				// };

				parent = {
					description: comments[i],
					cmd: comments[i].split(' ')[0],
					children: null
				};

				result.push(parent);

				children = [];

			}
			// This line has an indentation level higher than the 
			// current indentation level; it is a 'child' element and 
			// we should add it to the list of children to be added.
			else {
				children.push(comments[i]);
			}

		}

		// Push any last children to the result object. This handles 
		// any 'dangling' children that appear last in the list.
		if(children.length > 0) {
			for(j = 0; j < children.length; j++) {
				children[j] = children[j].slice(2);
			}

			parent.children = this.makeObject(children);
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


