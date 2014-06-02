// Wiring Functions
// ================
// Functionality for wiring code into files or retrieving code from 
// blocks within a file.

'use strict';

// findMatchingBrace Function
// --------------------------
// Exactly what it says. Starts at some brace which is designated 
// count 1. When the count reaches zero, it returns the current 
// index. If you start the function inside of some brace, it will 
// find the matching brace for it.
var findMatchingBrace = function (start, block) {
	var blockCount = 1;
	var i;

	for (i = start; i < block.length; i++) {
		if (block[i] === '{') {
			blockCount++;
		}
		else if (block[i] === '}') {
			blockCount--;
			if(blockCount === 0) {
				return i;
			}
		}
	}

	return -1;
};

// getInnerBlock Function
// ----------------------
// Retrieves the block of code defined inside the block.
exports.getInnerBlock = function (index, block) {
	var end, start = block.indexOf('{', index) + 1;

	end = findMatchingBrace(start, block);

	return block.slice(start, end).trim();
};

// getOuterBlock Function
// ----------------------
// Retreives the whole block, including the wrapper function.
exports.getOuterBlock = function (index, block) {
	var end, start;
	var blockCount = 0;

	var i;

	for (i = index; !start || i--; ) {
		if (block[i] === '\n') {
			start = i;
		}
	}

	end = findMatchingBrace(block.indexOf('{', start), block);

	return block.slice(start, end).trim();
};

// appendToBlock Function
// ----------------------
// Appends code to the end of a block.
exports.appendToBlock = function (text, block) {
	console.log(block);
	var index;
	if ((index = block.lastIndexOf('}')) === -1) {
		index = block.length;
	}
	return block.substr(0, index) + text + block.substr(index);
};