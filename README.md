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

Inline tests are parsed from comments beginning with `// describe <something>`. Inkblot supports other languages as well (in a limited way), but *works best at the moment with languages which use curly braces and BDD testing frameworks* (C, JavaScript, Java). I hope to extend this functionality to indentation-based languages and TDD keywords (setup, suite, etc.) in the near future.

The output directory can be changed by passing an option to the CLI.

    inkblot **/*.js --out="somedir"



------

### Comments

The default search string is `// describe` until `// end`. *If the language you are using does not use the double slash `//` comment notation, you can add the language to the `languages.json` file in the `lib` directory.*

Example:
```javascript
// describe some function
    it('should exist', function() {
        expect(someFunction).to.exist;
    });
// end
```

Everything inside the code block will be interpreted as a unit test which will be output to the `somefile.spec.js` file (or whatever extension you are using). __Currently, inkblot only recognizes `it` tests.__

#### Custom Templates

The unit test code between the describe and end comments is parsed by the program and run through custom templates. If you wish to create custom templates for your tests, inkblot searches through the `test/templates` directory for `template.<extension>` files.

The default templates are:

- `spec.jst`
- `it.jst` 
- `describe.jst` 
- `beforeEach.jst`

Roll your own templates using [underscore.js templating style](http://underscorejs.org/#template) and placing them in the `test/templates` directory with the extension of the files you are loading in. So, for example, if you are writing in C++, the file you load in, `dummy.cpp`, will prompt a search for `test/templates/spec.cpp` and so on.



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