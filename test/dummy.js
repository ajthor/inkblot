// test: require {name:inkblot} at {path:'../bin/inkblot.js'}
var inkblot = require('../bin/inkblot.js');

// test: describe function hello
// test:   it should be defined
var hello = function() {

}

// test: describe function world
// test:   it should be defined
var world = function() {

}

var dummy = module.exports = function dummy(name) {
	// this.name = name;
}

dummy.hello = {
	name: "Joe"
}

dummy.prototype.foo = function(dude) {
	console.log('dude');
};