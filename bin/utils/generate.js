// Generate Functions
// ==================
// Functions that accept a scaffolding object and generate a `.spec` 
// file from that object. The `generate` function looks in the spec 
// file and injects the tests into the blocks where they are needed.

'use strict';

var fs = require('fs');
var path = require('path');

var async = require('async');

// Load Template Function (Memoized)
// ---------------------------------
// In order to avoid loading the same template time after time, I 
// will memoize the output in order to load each template 
// only once.
var loadTemplate = async.memoize(function (obj, callback) {
	var file = path.resolve(path.join('../inkblot/lib/templates', obj.template + '.js'));

	fs.readFile(file, 'utf8', function (err, data) {
		if (err) {
			callback(err);
		}
		else {
			callback(null, data);
		}
	});
});

// generate Function
// -----------------
// 1. Load spec file. If no file exists, return an empty string.
exports.generate = function (file, obj, callback) {
	async.waterfall([

		// loadSpecFile
		// ------------
		// Loads spec from file using the path to the module to 
		// generate the name of the spec file.
		function loadSpecFile(callback) {
			var ext, base, specFile;

			ext = path.extname(file);
			base = path.basename(file, ext);
			specFile = path.join(this.options.out, base + '.spec' + ext);

			fs.exists(specFile, function(exists) {
				if(exists) {
					fs.readFile(specFile, 'utf8', function(err, data) {
						if (err) {
							console.log(err);
						}
						callback(null, obj, data);
					});
				}
				else {
					callback(null, obj, '');
				}
			});
		}

	],
	function (err, result) {
		if (err) {
			console.log(err);
		}

		callback(null, result);
	});

};



	// Append Tests
	// ------------
	// Search through the spec file if it exists and find the blocks 
	// where the current tests are going to go. Splice them into the 
	// blocks as necessary to avoid overwriting any custom 
	// user-defined tests.
	appendTests: function (obj, stream, callback) {
		var t, block, generatedTests;
		var index;

		console.log(obj);

		async.eachSeries(obj, function(item) {

			if (index = (stream.indexOf(item.description)) !== -1) {
				block = this.getBlock(index, stream);


			}
			else {
				// Just append.
			}

		}.bind(this),
		function(err) {
			if (err) {
				console.log(err);
			}

			callback(null, stream);
		});
	},

	// Generate
	// --------
	// Generates the actual text which will go inside the spec file. 
	// It loads the templates from file and populates them with 
	// values from each item in the object passed to it.
	generate: function (obj) {
		var stream = '';

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
				// recursively call generate on the object.
				item.children = this.generate(item.children);

				t = _.template(data, item);
				stream += t;

				next(null);

			}.bind(this));

		}.bind(this), 
		function (err) {
			if (err) {
				console.log(err);
			}
			callback(null, stream);
		});
	}


