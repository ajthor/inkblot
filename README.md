# inkblot

[![Build Status](https://travis-ci.org/ajthor/inkblot.svg?branch=master)](https://travis-ci.org/ajthor/inkblot) [![Code Climate](https://codeclimate.com/github/ajthor/inkblot.png)](https://codeclimate.com/github/ajthor/inkblot)

**Pre-Release Version of Inkblot** - Not yet fully functional.

Inline unit test tool.

Write unit tests using shorthand notation directly in the comments of your code. By simplifying the creation of unit tests, you can get to what really matters, writing the code!

Inkblot is a command-line tool to help write unit tests without having to switch back and forth between two open files. 

## Installation

If you don't have Node.js or NPM installed, install those first!

Install inkblot using NPM:

    npm install -g inkblot


## Usage

Once installed, simply call inkblot at the terminal using the format:

    inkblot <glob>

Inline tests are parsed from comments beginning with a `searchString`. The search string can be changed by passing an option to the CLI.

    inkblot **/*.js --searchString="something"

The output directory can be specified as well in the same way.

    inkblot **/*.js --out="somedir"

*I plan on extending this behavior in the near future with commander or minimist.*

### Comments

The default search string for comments is `// t:` until the newline character. Each line is a unit test which will be output to the `somefile.spec.js` file (or whatever extension you are using).

The unit test comments are parsed by the program and run through custom templates. In the near future, I hope to extend the program to search in the `test` folder of the cwd for custom templates so that inkblot can be extended by the end-user rather than just having a strict library of unit tests.

*Unit tests are indented with two spaces if they are nested in the block above them.*

Sample:

`somefile.js`

    // t: describe function {hello}
    // t:   it should accept {string:name}
    // t:   it should return a string
    exports.hello = function hello(name) {
    	return "Hello, " + name;
    }

Will output:

`somefile.spec.js`

    var hello = require('somefile.js').hello;

    describe('function hello', function() {

        var name = "test";
        
        it('should accept a string', function() {

            expect(function() {

                hello(name);

            }).not.toThrow();
        });

        it('should return a string', function() {
            expect(typeof hello(name)).toBe('string');
        });

    });

## Contributing

Any contributions are appreciated. Please fork and submit a pull request for any changes or submit suggestions or issues through the [issues](https://github.com/ajthor/inkblot/issues) tab.