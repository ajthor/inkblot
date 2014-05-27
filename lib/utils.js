var _ = require('underscore');

// Inkblot Template Utility Functions
// ==================================
// Available in the templates themselves in order to facilitate more 
// complex templates. Attached to each object before it is passed to 
// the template to be parsed.
var utils = function() {

};

_.extend(utils, {
	// Functions
	// =========

	// Variable Function
	// -----------------
	// If any variables are contained within the comment string, in 
	// the format {type key:value}, find them and return them here.
	variable: function(name) {
		var rx = /\{([^}]+)\}/g;
		var match;

		var result = {};

		var type, key, value;

		while(match = rx.exec(this.raw)) {
			// A colon ':' indicates there is a key/value pair. 
			// Everything before the colon should be the key, and 
			// everything after should be the value.
			if(match[1].indexOf(':') !== -1) {
				result.key = /^(\S+)\:/.exec(match[1])[1];
				result.value = /\:(\S+)/.exec(match[1])[1];
			}
			else {
				result.key = match[1];
			}

			if(result.key === name)
				return result;
		}

		return null;
	}
});

// Properties
// ==========

// Description Property
// --------------------
Object.defineProperty(utils, 'description', {
	get: function() {
		return this.raw;
	}
});

module.exports = utils;