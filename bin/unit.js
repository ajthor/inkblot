var _ = require('underscore');
var async = require('async');

var fs = require('fs');
var path = require('path');

exports.generate = function(obj, callback) {
	var file = path.join('../lib/templates', obj.cmd + '.js');


	fs.readFile(file, 'utf8', function(err, data) {
		if(err) throw err;

		var template;
		var stream = '';

		var childStream = '';

		async.eachSeries(obj.children, function(child, next) {
			children += this.generate(child);
			next(null);
		},
		function(err) {
			if(err) throw err;

			var obj = {
				description: obj.desc,
				children: childStream
			};

			stream = _.template(data);

			callback(null, stream);
		});

		
	});

};

	// var stream = '';
	// var cmd;
	// var i;
	// for(i in obj) {
	// 	cmd = obj[i].command.split(' ')[0];

	// 	if(exports[cmd] && cmd !== 'make') {
	// 		stream += exports[cmd](obj[i], function(children) {
	// 			var s = '';
	// 			var j;

	// 			if(children !== null) {
	// 				for(j in children) {
	// 					s += this.variables(children[j]);
	// 				}
	// 			}

	// 			s += this.make(children);

	// 			return s;

	// 		}.bind(this));
	// 	}
	// }