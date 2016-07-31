# inkblot :octopus:

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

Inline tests are parsed from comments beginning with `// TEST: <description>`. Inkblot supports other languages as well (in a limited way), but *works best at the moment with languages which use curly braces and BDD testing frameworks* (C, JavaScript, Java). I hope to extend this functionality to indentation-based languages and TDD keywords (setup, suite, etc.) in the near future.

The output directory can be changed by passing an option to the CLI.

```
inkblot **/*.js --out="<test directory>"
```

------

### Comments

The default search string is `// TEST:` until `// END`. *If the language you are using does not use the double slash `//` comment notation, you can add the language to the `languages.json` file in the `lib` directory.*

Example:
```javascript
// TEST: <Test description goes here>

    test code goes here

// END
```

This will output:
```javascript
  test('<Your description>', t => {

    your test code

  });
```

Everything inside the code block will be interpreted as a unit test which will be output to the `test_somefile.js` file (or whatever extension you are using).
------

### Sample:

File: `somefile.js`
```javascript
// describe somefile
    it('should return a string', function() {
        expect(somefile()).to.be.a('string');
    });
// end

var hello = module.exports = function hello(name) {
    return "Hello, " + name;
};
```

Output: `test/somefile.spec.js`
```javascript
var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

var exported = require('../somefile.js');

describe('somefileJs', function() {

    var somefileJs = exported;

    it('should return a string', function() {
        expect(somefile()).to.be.a('string');
    });

});
```

------

## Contributing

Any contributions are appreciated. Please fork and submit a pull request for any changes or submit suggestions or issues through the [issues](https://github.com/ajthor/inkblot/issues) tab.
