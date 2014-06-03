// Scaffolding Functions
// =====================
// Takes the contents of a file and generates unit tests for 
// everything encapsulated within the object.

'use strict';

var _ = require('underscore');

var async = require('async');
var path = require('path');

var test = require('./test.js');

// Scaffold Function (async)
// -------------------------
exports.scaffold = function (file, callback) {		
	var ext = path.extname(file);
	var base = path.basename(file, ext);

	async.waterfall([

		// loadModule Function
		// -------------------
		// Tries to load the module specified by the `file` variable. 
		// If it loads, it calls `generateScaffolding` to generate a 
		// scaffolding object. If it can't load the module, meaning 
		// Node doesn't recognize it, then it returns an emty array.
		function loadModule(callback) {
			var module = null;
			var obj = [];

			try {
				module = require(file);
				obj = generateScaffolding(base, module);
			}
			catch(e) {
				console.warn('WARN: cannot scaffold module [ %s ]', file);
				if (e) {
					console.error('Error: ', e.stack);
				}
			}
			finally {
				callback(null, obj);
			}
		}

	],
	function(err, result) {
		if (err) {
			console.log(err);
		}

		callback(null, file, result);
	})
};

// generateScaffolding Function
// ----------------------------
// Using the output of a module, the `scaffold` function 
// traverses the object and generates a suite of unit tests to 
// cover the module. If the objects have prototypes, it will 
// create tests to cover the prototypes as well.
var generateScaffolding = function (key, obj) {
	var result = [];
	var children = [];
	var protoChildren = [];

	var item;

	// Based on the type of 'obj' passed to the scaffold 
	// function, we will create different unit tests depending on 
	// that type. Objects and functions will require nested tests 
	// whereas primitives will require fewer. Perhaps only 
	// existence checks.
	switch (typeof obj) {
	case 'object':
	case 'function':

		children.push(new test({
			template: 'it',
			raw: 'should exist',
			code: 'expect(<%= variable(\'name\') %>).to.exist;',
			variables: {
				name: (key || _.uniqueId(typeof obj))
			}
		}));
		// If there are any static functions or properties on 
		// this object or function, then create unit tests 
		// for them.
		for (item in obj) {
			if (obj.hasOwnProperty(item)) {
				children = children.concat(generateScaffolding(item, obj[item]));
			}
		}

		// If the function or object has a prototype that 
		// 'hasOwnProperties', then create unit tests for 
		// those properties.
		for (item in obj.prototype) {
			if (obj.prototype.hasOwnProperty(item)) {
				protoChildren = protoChildren.concat(generateScaffolding(item, obj[item]));
			}
		}
		if (protoChildren.length) {
			children.push(new test({
				raw: key + '.prototype',
				variables: {
					name: key + 'Proto'
				}
			}, protoChildren));
		}

		// Once the children have been generated, we can 
		// create the test that will be the parent of all of 
		// these children, which is essentially the test for 
		// the object passed to the `scaffold` function. 
		// Using the `key` argument, or, if none is provided, 
		// a unique identifier, generate some unit test.
		result.push(new test({
			raw: typeof obj + ' ' + key,
			variables: {
				name: (key || _.uniqueId(typeof obj))
			}
		}, children));
		break;
	// If the 'obj' passed to the scaffolding function is 
	// not either an object nor a function, it means it is 
	// another primitive data type and we simply need to 
	// generate some test for it. Perhaps just to check if it 
	// exists.
	default:
		result.push(new test({
			raw: key,
			variables: {
				name: (key || _.uniqueId(typeof obj))
			}
		}, [new test({
				template: 'it',
				raw: 'should exist',
				code: 'expect(<%= variable(\'name\') %>).to.exist;',
				variables: {
					name: (key || _.uniqueId(typeof obj))
				}
			})]
		));
		break;
	}

	return result;
};


