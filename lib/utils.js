// Inkblot Template Utility Functions
// ==================================
// Available in the templates themselves in order to facilitate more 
// complex templates. Attached to each object before it is passed to 
// the template to be parsed.
var utils = {
	variable: function(name) {
		var rx = /\{([^}]+)\}/g;
		var match;

		var type, key, value;

		while(match = rx.exec(this.description)) {
			type = /(\S+)\s/.exec(match[1]);
			key = /(\S+)\:/.exec(match[1]);
			value = /\:(\S+)/.exec(match[1]);

			if(key[1] === name)
				return value[1];
		}

		return null;
	}
};

// Properties
// ==========

// Variable Property
// -----------------
// If any variables are contained within the comment string, in the 
// format {type key:value}, find them and return them here.
// Object.defineProperty(utils, 'variable', {
// 	get: function(name) {
// 		var rx = /\{([^}]+)\}/g;
// 		var match = rx.exec(this.description);

// 		return match;
// 	}
// });

module.exports = utils;