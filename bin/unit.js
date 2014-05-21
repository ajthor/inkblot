var _ = require('underscore');

var make = exports.make = function(obj) {
	var stream = '';
	var cmd;
	var i;
	for(i in obj) {
		cmd = obj[i].command.split(' ')[0];

		if(exports[cmd] && cmd !== 'make') {
			stream += exports[cmd](obj[i], function(children) {
				var s = '';
				var j;

				if(children !== null) {
					for(j in children) {
						s += this.variables(children[j]);
					}
				}

				s += this.make(children);

				return s;

			}.bind(this));
		}
	}

	return stream;
};

exports.getVariables = function(obj) {
	var rx = /\{([^}]+)\}/g;
	var match, matches = [];

	while((match = rx.exec(obj.command)) !== null) {
		matches.push(match[1]);
	}

	return matches;
};

exports.variables = function(obj) {
	var s = '';
	var i;

	var variables = this.getVariables(obj);
	variables = _.unique(variables);

	for(i = variables.length; i--; ) {
		s += 'var ' + variables[i] + ';\n\n';
	}

	return s;
};

exports.describe = function(obj, cb) {
	var s;
	s = 'describe(\'' + obj.command + '\', function() {\n\n';
	s += cb(obj.children);
	s += '});\n\n';
	return s;
};

exports.it = function(obj, cb) {
	var s;
	s = 'it(\'' + obj.command + '\', function() {\n\n';
	s += cb(obj.children);
	s += '});\n\n';
	return s;
};

exports.require = function(obj, cb) {
	var s;
	var i;
	var variables = this.getVariables(obj);
	if(variables.length !== 2) {
		s = 'var ' + variables[0] + ' = require(\'' + variables[1] + '\');';
	}
	else if(variables.length === 1) {
		s = 'var ' + variables[0] + ' = require(\'' + variables[0] + '\');';
	}
	else {
		throw 'Require statement for ' + obj.command + ' must have one or two variables.';
	}

	return s;
};



// describe(obj, function(children) {
// 	var s = '';
// 	var i;

// 	s += make(children);

// 	return s;
// });