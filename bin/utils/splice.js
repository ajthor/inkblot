// Splice Functions
// ================
// These functions splice tests found inside files into scaffolded 
// modules or into empty arrays if no modules can be scaffolded. 
// Basically, it searches for the test blocks, and if they exist in 
// the scaffolding object, it splices them into the object where they 
// need to go.

'use strict';

var fs = require('fs');
var path = require('path');

var async = require('async');

var inquirer = require('inquirer');

var test = require('./test.js');
var wiring = require('./wiring.js');

// searchObject Function
// ---------------------
// Finds tests inside the scaffolding object to splice into. Returns 
// a reference to the array.
var searchObject = function (needle, haystack) {
	var result = null;
	for (var i in haystack) {
		if(haystack[i].raw === needle) {
			result = haystack[i];
		}
		else if(haystack[i].children.length) {
			result = searchObject(needle, haystack[i].children);
		}

		if(result) {
			return result;
		}
	}

	return result;
};

// spliceObject Function
// ---------------------
// Using the scaffolded object generated by the `scaffold` function, 
// or the empty array passed if the module could not be loaded, 
// splice the code in the source file into unit test objects and put 
// them into the scaffolding object where they belong.
exports.spliceObject = function (file, data, obj, done) {
	var match;

	// Regular Expressions
	// -------------------
	var rxDescribe = new RegExp('\s*'+file.symbol+' (describe (.+))\n', 'g');
	var rxIt       = new RegExp('it\\((?:\'|")(.*)(?:\'|")', 'g');
	// var rxEnd      = new RegExp(this.options.comment + ' end', 'g');

	async.whilst(
		function () {
			return ((match = rxDescribe.exec(data)) !== null);
		},
		function (callback) {
			var target;
			var ref;

			var block, itBlock;
			var blockMatch;

			var child;
			// If the describe block already exists in the spec file, 
			// then we can assume that the user intended to add the 
			// unit test to that block. So, add the spec to the block 
			// as a new child test.
			ref = searchObject(match[2], obj);

			block = data.slice(match.index + match[0].length, data.indexOf(file.symbol+' end', match.index));

			// If nothing is found, we can assume that the test is 
			// something new that we aren't expecting to be tested.
			if (!ref) {
				ref = new test({
					raw: match[2]
				});

				while ((blockMatch = rxIt.exec(block)) !== null) {
					itBlock = wiring.getInnerBlock(blockMatch.index, blockMatch.input);

					ref.children.push(new test({
						template: 'it',
						raw: blockMatch[1],
						code: itBlock
					}));
				}

				obj.push(ref);
			}
			// Otherwise, it has been found. In this case, just 
			// append the 'it' blocks to the 'describe' block if they 
			// don't exist already.
			else {

				while ((blockMatch = rxIt.exec(block)) !== null) {
					itBlock = wiring.getInnerBlock(blockMatch.index, blockMatch.input);

					target = null;

					for (child in ref.children) {
						if (ref.children[child].raw === blockMatch[1]) {
							target = ref.children[child];
						}
					}

					if (target) {
						target.code = itBlock;
					}
					else {
						ref.children.push(new test({
							template: 'it',
							raw: blockMatch[1],
							code: itBlock
						}));
					}
				}

			}

			// Remove the block once the tests have been pulled out of it
			block = data.slice(match.index, data.indexOf(file.symbol+' end', match.index) + 7);
			data = data.replace(block, '');

			callback(null);

		}.bind(this),

		function (err) {
			if (err) {
				done(err);
			}

			done(null, file, data, obj);
		}.bind(this)
	);
};

exports.saveFile = function (file, data, callback) {
	fs.writeFile(file.path, data, function (err) {
		if (err) {
			return callback(err);
		}

		this.log('save: ', '\'' + file.name + '\'');
		callback(null);

	}.bind(this));
};

// writeJSON Function
// ------------------
// Mostly a developer function to output the entire object created by 
// inkblot from scaffolding the object and parsing the comments.
exports.writeJSON = function (file, data, obj, done) {
	var filePath = path.join('./test/', file.base + '.json');

	if (this.options.createJSON) {
		fs.writeFile(filePath, JSON.stringify(obj, null, 2), function (err) {
			if (err) {
				this.log(err);
			}
			else {
				this.log('save: ', '\'' + filePath + '\'');
				done(null, file, data, obj);
			}
		}.bind(this));
	}

	done(null, file, data, obj);

};

// cleanOriginal Function
// ----------------------
// Saves the cleaned file back to the original location.
exports.cleanOriginal = function (file, data, obj, callback) {
	if (this.options.autoRemove) {
		this.saveFile(file, data, function (err) {
			if (err) {
				this.log(err);
			}

			callback(null, file, data, obj);
		}.bind(this));
	}
	else {
		if (this.options.enablePrompts) {
			inquirer.prompt({
				type: 'confirm',
				name: 'overwrite',
				message: 'Do you want to remove inline tests from ' + file.base + '?',
				default: false
			}, function (answers) {
				if (answers.overwrite === true) {
					this.saveFile(file, data, function (err) {
						if (err) {
							this.log(err);
						}

						callback(null, file, data, obj);
					}.bind(this));
				}

				callback(null, file, data, obj);

			}.bind(this));
		}

		callback(null, file, data, obj);
	}
};

// splice Function (async)
// -----------------------
// Accepts a file name and an object to splice the file into and 
// joins the two.
exports.splice = function (file, obj, done) {
	async.waterfall([
		function (callback) {
			var data = file._contents.toString('utf8');

			if (data && (data.indexOf(file.symbol+' describe') === -1)) {
				return callback('No inkblot comments in file: ' + file.name);
			}

			callback(null, file, data, obj);
		}.bind(this),

		this.spliceObject.bind(this),

		this.writeJSON.bind(this),

		this.cleanOriginal.bind(this),

		// Return just the object as the result of the waterfall.
		function (file, data, obj, callback) {
			callback(null, obj);
		}

	],
	function (err, result) {
		if (err) {
			this.log(err);
			return done(null, file, obj);
		}

		done(null, file, result);
	}.bind(this));

	
};


