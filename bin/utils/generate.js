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
	var templateFile = path.resolve(path.join('../inkblot/lib/templates', template + '.js'));

	fs.readFile(templateFile, 'utf8', function (err, data) {
		if (err) {
			callback(err);
		}
		else {
			callback(null, data);
		}
	});
});

// generateSpec Function
// ---------------------
// Generates the actual text which will go inside the spec file. 
// It loads the templates from file and populates them with 
// values from each item in the object passed to it.
var generateSpec = function (obj, done) {
	var stream = '';

	if (!Array.isArray(obj)) {
		done(null, '');
	}
	else {
		async.eachSeries(obj, function (item, next) {
			var t;
			var templateFile = path.resolve(path.join('../inkblot/lib/templates', item.template + '.js'));

			// Read the template and parse the object into the 
			// template to create a test.
			fs.readFile(templateFile, 'utf8', function (err, data) {
				if (err) {
					this.log(err);
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
						this.log(err);
					}

					item.code = _.template(item.code, item);
					item.children = result;

					t = _.template(data, item);

					stream += t;

					next(null);
				}.bind(this));

			}.bind(this));

		}, 
		function (err) {
			if (err) {
				this.log(err);
			}
			done(null, stream);
		}.bind(this));
	}
};

// trimWhitespace Function
// -----------------------
// Helper function for diffBlocks function.
var trimWhitespace = function (block) {
	block = block.replace(/\n/g, '');
	block = block.replace(/\t/g, '');
	block = block.replace(/\s/g, '');

	return block;
};

// diffBlocks Function
// -------------------
// Helper function to diff code blocks.
var diffBlocks = function (block1, block2) {
	block1 = trimWhitespace(block1);
	block2 = trimWhitespace(block2);
	return (block1 !== block2);
};


// spliceTests Function
// --------------------
// Search through the spec file if it exists and find the blocks 
// where the current tests are going to go. Splice them into the 
// blocks as necessary to avoid overwriting any custom 
// user-defined tests.
exports.spliceTests = function (obj, stream, callback) {
	var block = '';
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
						this.log(err);
					}

					stream = stream.replace(block, result);

					next(null);
				}.bind(this));
			}
			// If the test doesn't have any children, it means this 
			// test is at the end of a branch, and we can just 
			// compare the code that is inside of this test to see if 
			// it matches the code in the spec file. If the two are 
			// different, we need to check for conflicts.
			else {
				async.waterfall([
					function (callback) {
						callback(null, [item]);
					},

					generateSpec
				],
				function (err, result) {
					if (err) {
						this.log(err);
					}

					block = wiring.getOuterBlock(index, stream);

					if (diffBlocks(block, result)) {

						inquirer.prompt([{
							type: 'confirm',
							name: 'replace',
							message: 'TEST: \'' + item.description + '\' has changed. Replace it?',
							default: true
						}], function (answer) {

							if (answer.replace) {
								stream = stream.replace(block, result.trim());
							}

							next(null);
						});

					}
					else {
						next(null);
					}
				}.bind(this));


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
					this.log(err);
				}
				stream += result.trim();
				next(null);
			}.bind(this));
		}

	}.bind(this),
	function (err) {
		if (err) {
			this.log(err);
		}

		callback(null, stream);
	});
};

// generate Function (async)
// -------------------------
exports.generate = function (file, obj, callback) {
	this.log('..generating');

	async.waterfall([
		// loadSpecFile
		// ------------
		// Loads spec from file using the path to the module to 
		// generate the name of the spec file.
		function loadSpecFile(callback) {
			fs.exists(file.spec, function (exists) {
				if (exists) {
					fs.readFile(file.spec, 'utf8', function (err, data) {
						if (err) {
							this.log(err);
						}
						callback(null, obj, data);
					});
				}
				else {
					callback(null, obj, '');
				}
			}.bind(this));
		}.bind(this),

		this.spliceTests.bind(this)

	],
	// applySpecTemplate Function
	// --------------------------
	// Takes the ouput stream of the previous function and passes it 
	// through a standard spec template.

	// i.e, If the result is based on a new file, we will need to 
	// include the proper testing headers (chai libraries, etc.)
	function (err, result) {
		if (err) {
			this.log(err);
		}

		if (result.indexOf('require(\'chai\')') === -1) {
			fs.readFile(path.resolve(path.join('../inkblot/lib/templates/spec.js')), 'utf8', function (err, data) {
				if (err) {
					this.log(err);
				}

				result = _.template(data, {
					name: obj[0].variables.name,
					path: file.path,
					code: result
				});

				callback(null, result);
			}.bind(this));
		}
		else {
			callback(null, result);
		}

	}.bind(this));

};


