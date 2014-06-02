// Generate Functions
// ==================
// Functions that accept a scaffolding object and generate a `.spec` 
// file from that object. The `generate` function looks in the spec 
// file and injects the tests into the blocks where they are needed.

'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('underscore');
var async = require('async');

var inquirer = require('inquirer');

var wiring = require('./wiring.js');

// Load Template Function (Memoized)
// ---------------------------------
// In order to avoid loading the same template time after time, I 
// will memoize the output in order to load each template 
// only once.
var loadTemplate = async.memoize(function (template, callback) {
	var file = path.resolve(path.join('../inkblot/lib/templates', template + '.js'));

	fs.readFile(file, 'utf8', function (err, data) {
		if (err) {
			callback(err);
		}
		else {
			callback(null, data);
		}
	});
});

// generate Function (async)
// -------------------------
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
		}.bind(this),

		// Splice Tests
		// ------------
		// After loading the spec file, splice the tests 
		// into the spec.
		this.spliceTests.bind(this)

	],
	// applySpecTemplate Function
	// --------------------------
	// Takes the ouput stream of the previous function and passes it 
	// through a standard spec template which adds chai libraries and 
	// other required variables to file.
	function (err, result) {
		if (err) {
			console.log(err);
		}

		callback(null, result);
	});

};



// spliceTests Function
// --------------------
// Search through the spec file if it exists and find the blocks 
// where the current tests are going to go. Splice them into the 
// blocks as necessary to avoid overwriting any custom 
// user-defined tests.
exports.spliceTests = function (obj, stream, callback) {
	var t, generatedTests, block = '';
	var index;

	async.eachSeries(obj, function (item, next) {

		index = item.description ? stream.indexOf(item.description) : stream.indexOf(item.template);
		
		// If the block exists, we need to cycle through the children
		// of this object and see if they have corresponding tests
		// inside this block. If they do, we may need to overwrite
		// those tests. Prompt for overwrite.
		if (index !== -1) {
			block = wiring.getInnerBlock(index, stream);

			if (item.children.length) {
				async.waterfall([
					function (callback) {
						callback(null, item.children, block);
					},

					this.spliceTests.bind(this)

				],
				function (err, result) {
					if (err) {
						console.log(err);
					}

					stream = stream.replace(block, result);

					next(null);
				});
			}
			// If the test doesn't have any children, it means this 
			// test is at the end of a branch, and we can just 
			// compare the code that is inside of this test to see if 
			// it matches the code in the spec file. If the two are 
			// different, we need to check for conflicts.
			else {

				if (item.code.trim() !== block.trim()) {
					// inquirer.prompt([
					// 	{
					// 		type: 'expand',
					// 		name: 'choice',
					// 		message: (function () {
					// 			return 'The code: \n\n' + item.code.trim() + '\n\nDoes not match the code in the spec file: \n\n' + block.trim() + '\n\nReplace anyway?';
					// 		})(),
					// 		choices: [
					// 			{
					// 				key: 'y',
					// 				name: 'Overwrite',
					// 				value: 'overwrite'
					// 			},
					// 			{
					// 				key: 'a',
					// 				name: 'Overwrite all',
					// 				value: 'overwriteAll'
					// 			},
					// 			{
					// 				key: 'd',
					// 				name: 'Show diff',
					// 				value: 'diff'
					// 			},
					// 			{
					// 				key: 'n',
					// 				name: 'Don\'t overwrite',
					// 				value: 'noOverwrite'
					// 			},
					// 			{
					// 				key: 'x',
					// 				name: 'Abort',
					// 				value: 'abort'
					// 			}
					// 		]
					// 	}
					// ], function (answers) {
					// 	console.log(answers);
					// 	next(null);
					// });

					async.waterfall([
						function (callback) {
							callback(null, [item]);
						},

						generateSpec
					],
					function (err, result) {
						if (err) {
							console.log(err);
						}

						// We don't replace 'describe' blocks.
						if (item.template !== 'describe') {
							console.log('Replacing unit test:', item.description);
							
							stream = stream.replace(block, result);
						}

						next(null);
					});

				}
				else {
					next(null);
				}

			}

		}
		// If the block wasn't found, then it's safe to assume that 
		// this particular test doesn't exist yet. In which case, we 
		// can append this test to the end of the block.
		else {
			async.waterfall([
				function (callback) {
					callback(null, [item]);
				},

				generateSpec
			],
			function (err, result) {
				if (err) {
					console.log(err);
				}
				stream += '\n\n' + result.trim();
				next(null);
			})
		}

	}.bind(this),
	function(err) {
		if (err) {
			console.log(err);
		}

		callback(null, stream);
	});
};

// generateSpec Function
// ---------------------
// Generates the actual text which will go inside the spec file. 
// It loads the templates from file and populates them with 
// values from each item in the object passed to it.
var generateSpec = function (obj, callback) {
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
				// recursively call generate on the object.
				async.waterfall([
					function (callback) {
						callback(null, item.children);
					},

					generateSpec
				], 
				function (err, result) {
					if (err) {
						console.log(err);
					}

					item.children = result;

					t = _.template(data, item);

					stream += t;

					next(null);
				});

			});

		}, 
		function (err) {
			if (err) {
				console.log(err);
			}
			callback(null, stream);
		});
	}
};


