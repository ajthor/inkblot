// Wiring Functions
// ================
// Functionality for wiring code into files or retrieving code from 
// blocks within a file.

'use strict';

// getBlock Function
// -----------------
// Retrieves the block of code defined 
exports.getBlock = function (index, block) {
	var end, start = block.indexOf('{', index) + 1;
	var blockCount = 1;

	var i;

	for (i = start; i < block.length; i++) {
		if (block[i] === '{') {
			blockCount++;
		}
		else if (block[i] === '}') {
			blockCount--;
			if(blockCount === 0) {
				// end = block.indexOf('\n', i);
				end = i;
				return block.slice(start, end).trim();
			}
		}
	}
};


