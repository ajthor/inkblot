'use strict';

var _ = require('underscore');


var rxCurly = /\{([^}]+)\}/g;

// Test Object
// ===========
var test = module.exports = function (options, children) {
	_.defaults(this, options, {
		template: 'describe',
		raw: '',
		code: ''
	});

	if ((typeof children === 'undefined') || (children === null)) {
		children = [];
	}

	this.initialize.call(this, children);
};

// Inkblot Template Utility Functions
// ==================================
// Available in the templates themselves in order to facilitate more 
// complex templates. Attached to each object before it is passed to 
// the template to be parsed.
_.extend(test.prototype, {
	initialize: function (children) {

		this.getVariables();

		this.description = (function () {
			var desc = this.raw;
			desc = desc.replace(/\{\S+\:/, '');
			desc = desc.replace(/\}/, '');
			return desc;
		}.bind(this))();

		this.children = children;

	},
	// Functions
	// =========

	// Variable Function
	// -----------------
	// If any variables are contained within the comment string, in 
	// the format {key:value}, find them and return them here.
	getVariables: function () {
		if (!this.variables) this.variables = {};
		var match;
		var key, value;

		while (match = rxCurly.exec(this.raw)) {
			if (match[1].indexOf(':') !== -1) {
				key = /^(\S+)\:/.exec(match[1])[1];
				value = /\:(\S+)/.exec(match[1])[1];

				this.variables[key] = value;
			}
		}

		return this.variables;
	},

	variable: function (name) {
		for (var key in this.variables) {
			if (key === name) {
				return this.variables[key];
			}
		}

		this.variables[name] = _.uniqueId(name);
		return this.variables[name];
	}
});


