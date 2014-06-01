// Splice Functions
// ================
// These functions splice tests found inside files into scaffolded 
// modules or into empty arrays if no modules can be scaffolded. 
// Basically, it searches for the test blocks, and if they exist in 
// the scaffolding object, it splices them into the object where they 
// need to go.

'use strict';

var fs = require('fs');

var test = require('./test.js');
var wiring = require('./wiring.js');

// Regular Expressions
// -------------------
var rxDescribe = /\s*\/\/ (describe (.+))\n/g;
var rxIt =       /it\\((?:\'|")(.*)(?:\'|")/g;

// splice Function (async)
// -----------------------
// Accepts a file name and an object to splice the file into and 
// joins the two.
exports.splice = function (file, obj, callback) {
	fs.readFile(file, {encoding: 'utf8'}, function (err, data) {
		var result;

		if (data.indexOf(this.options.searchString) === -1) {
			callback(new Error('No inkblot comments in file: ' + file), data);
		}

		result = spliceObject(data, obj);

		callback(null, result);
	}.bind(this));
};

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
var spliceObject = function (data, obj) {
	var match;
	var target;
	var ref, code;

	var block, itBlock;
	var blockMatch;

	var child;

	while ((match = rxDescribe.exec(data)) !== null) {
		// If the describe block already exists in the spec file, 
		// then we can assume that the user intended to add the 
		// unit test to that block. So, add the spec to the block 
		// as a new child test.
		ref = searchObject(match[2], obj);

		block = data.slice(match.index + match[0].length, data.indexOf('// end', match.index));

		// If nothing is found, we can assume that the test is 
		// something new that we aren't expecting to be tested.
		if (!ref) {
			obj.push(new test({
				raw: match[1],
				code: block
			}));
		}
		// Otherwise, it has been found. In this case, just 
		// append the 'it' blocks to the 'describe' block if they 
		// don't exist already.
		else {

			while ((blockMatch = rxIt.exec(block)) !== null) {
				itBlock = wiring.getBlock(blockMatch.index, blockMatch.input);

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

	}

	return obj;
};


