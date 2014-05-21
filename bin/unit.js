var make = exports.make = function(obj) {
	var stream = '';
	var cmd;
	var i;
	for(i in obj) {
		cmd = obj[i].command.split(' ')[0];

		if(exports[cmd] && cmd !== 'make') {
			stream += exports[cmd](obj[i], function(children) {
				return this.make(children);

			}.bind(this));
		}
	}

	return stream;
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



// describe(obj, function(children) {
// 	var s = '';
// 	var i;

// 	s += make(children);

// 	return s;
// });