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
var test = require('../lib/utils.js').test;

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
			// Resolve the file name.
			function fileName(callback) {
				process.stdout.write('[ ' + file + ' ]\n');
				file = path.resolve(file);

				// Make sure the file being loaded is not a '.spec'. 
				// If it is, quit and move on to the next file.
				if(file.indexOf('.spec') !== -1) {
					callback(new Error('Cannot run inkblot on a spec file: ' + file), null);
				}

				fs.exists(file, function(exists) {
					if(!exists) {
						callback(new Error('File does not exist.'));
					}

					callback(null);
				});
			},

			// Load module.
			function loadModule(callback) {
				var module = null;

				try {
					module = require(file);
				}
				catch(e) {
					console.warn('WARN: [ %s ] is not a loadable node module.', file);
					if(e) {
						console.error('Error: ', e);
					}
				}
				finally {
					callback(null, module);
				}
			}.bind(this),

			// // Load File
			// // ---------
			// // Load the file into the stream and check to see if 
			// // there are any test comments in it. 
			// // If not, no need to continue.
			// function loadFile(module, callback) {
			// 	fs.readFile(file, {encoding: 'utf8'}, function(err, data) {
			// 		if(data.indexOf(searchString) === -1) {
			// 			callback(new Error('No inkblot comments in file: ' + file), data);
			// 		}

			// 		callback(null, module, data);
			// 	}.bind(this));

			// }.bind(this),

			// // Find comments.
			// this.findComments.bind(this),

			// function(comments, callback) {
			// 	var obj = this.makeObject(comments);
			// 	callback(null, '');
			// }.bind(this)

			this.generate.bind(this)

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
		var file = path.resolve(path.join('../inkblot/lib/templates', obj.template + '.js'));

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
	findComments: function(module, data, callback) {
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
		var current, child, children;
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
				current = comments.splice(i, 1)[0];

				obj.push({
					template: current.split(' ')[0],
					raw: current,
					children: children
				});
			}
		}

		return obj;
	},

	// Generate
	// --------
	// Generates the actual text which will go inside the spec file. 
	// It loads the templates from file and populates them with 
	// values from each item in the object passed to it.
	generate: function(obj, callback) {
		var stream = '';

		if(!Array.isArray(obj)) {
			callback(null, '');
		}
		else {
			async.eachSeries(obj, function(item, next) {
				var t;
				var file = path.resolve(path.join('../inkblot/lib/templates', item.template + '.js'));

				// Read the template and parse the object into the 
				// template to create a test.
				fs.readFile(file, 'utf8', function(err, data) {
					if(err) console.log(err);

					// If the node has children, meaning there are some 
					// items which should go inside this one, then 
					// recursively call generate on the object using 
					// async function calls.
					async.waterfall([
						function(callback) {
							callback(null, item.children);
						},

						this.generate.bind(this)
					], 
					function(err, result) {
						if(err) console.log(err);

						item.children = result;

						t = _.template(data, item);

						// Change here.
						stream += t;

						next(null);
					});
				}.bind(this));

			}.bind(this), 
			function(err) {
				if(err) console.log(err);
				callback(null, stream);
			});
		}
	}

});


