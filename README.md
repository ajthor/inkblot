# inkblot

[![Build Status](https://travis-ci.org/ajthor/inkblot.svg?branch=master)](https://travis-ci.org/ajthor/inkblot) [![Code Climate](https://codeclimate.com/github/ajthor/inkblot.png)](https://codeclimate.com/github/ajthor/inkblot)

Inline unit test tool.

Write unit tests using shorthand notation directly in the comments of your code. By simplifying the creation of unit tests, you can get to what really matters, writing the code!

Inkblot is a command-line tool to help write unit tests without having to switch back and forth between two open files. 

## Installation

If you don't have Node.js or NPM installed, install those first!

Then, install inkblot using NPM:

    npm install -g inkblot

------

## Usage

Once installed, simply call inkblot at the terminal using the format:

    inkblot <glob>

Inline tests are parsed from comments beginning with `// describe <something>`.

The output directory can be changed by passing an option to the CLI.

    inkblot **/*.js --out="somedir"

*I plan on extending this behavior in the near future with commander or minimist.*

------

### Comments

The default search string is `// describe` until `// end`. 

Example:
```javascript
// describe some function
    it('should exist', function() {
        expect(someFunction).to.exist;
    });
// end
```

Everything inside the code block will be interpreted as a unit test which will be output to the `somefile.spec.js` file (or whatever extension you are using). __Currently, inkblot only recognizes `it` tests. This will be expanded in the near future.__

The unit test code between the describe and end comments is parsed by the program and run through custom templates. In the near future, I hope to extend the program to search in the `test/templates` folder of the cwd for custom templates so that inkblot can be extended by the end-user rather than just having a strict library of unit tests.

Sample:

`somefile.js`
```javascript
// describe exports.hello
    it('should return a string', function() {
        expect(hello()).to.be.a('string');
    });
// end

var hello = module.exports = function hello(name) {
	return "Hello, " + name;
};
```
Will output:

`somefile.spec.js`
```javascript
var hello = require('somefile.js');

describe('function hello', function() {

    var hello;

    it('should return a string', function() {
        expect(hello()).to.be.a('string');
    });

});
```

------

## Contributing

Any contributions are appreciated. Please fork and submit a pull request for any changes or submit suggestions or issues through the [issues](https://github.com/ajthor/inkblot/issues) tab.