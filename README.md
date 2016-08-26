# inkblot :octopus:

[![Build Status](https://travis-ci.org/ajthor/inkblot.svg?branch=master)](https://travis-ci.org/ajthor/inkblot) [![Coverage Status](https://coveralls.io/repos/github/ajthor/inkblot/badge.svg?branch=master)](https://coveralls.io/github/ajthor/inkblot?branch=master) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Inline unit test tool.

Write unit tests using shorthand notation directly in the comments of your code. By simplifying the creation of unit tests, you can get to what really matters, writing the code!

Inkblot is a command-line tool to help write unit tests without having to switch back and forth between two open files.

## Installation

If you don't have Node.js or NPM installed, install those first!

Then, install inkblot using NPM:

    npm install -g inkblot

## Usage

Once installed, simply call inkblot at the terminal using the format:

    inkblot <glob>

Inline tests are parsed from comments beginning with `// TEST {<identifier>}`. Inkblot supports other languages as well (in a limited way), but *works best at the moment with languages which use double-slash comment style* (C, JavaScript, etc). I hope to extend this functionality to other comment types in the future.

Also, the tests are, by default, output into a file that uses the [AVA](https://github.com/avajs/ava) testing framework. If you don't already know about __AVA__, be sure to check it out. If the file doesn't already exist, it will create a file with `import test from 'ava';` at the beginning of the file.

The output directory can be changed by passing an option to the CLI.

```
inkblot **/*.js -o <test directory>
```

------

### Comments

The default search string is `// TEST` until `// END`.

Example:
```javascript
// TEST {<Test identifier goes here>}

    test code goes here

// END
```

Everything inside the code block will be interpreted as a block which will be output to the `test_somefile.js` file (or whatever extension you are using).

### Sample

File: `somefile.js`
```javascript
// TEST { import someFunction }
import {someFunction} from 'somefile';
// END

// TEST { someFunction }
test.beforeEach(t => {
  t.context.someFunction = someFunction;
});

test('someFunction exists', t => {
  t.truthy(t.context.someFunction, 'someFunction exists!');
});
// END

const someFunction = name => {
  return `Hello, ${name}`;
};

module.exports = {
  someFunction
};
```

Output: `test/test_somefile.js`
```javascript
'use strict';
import test from 'ava';

// TEST { import someFunction }
import {someFunction} from 'somefile';
// END

// TEST { someFunction }
test.beforeEach(t => {
  t.context.someFunction = someFunction;
});

test('someFunction exists', t => {
  t.truthy(t.context.someFunction, 'someFunction exists!');
});
// END
```

## Contributing

Any contributions are welcome and appreciated. Please fork and submit a pull request for any changes or submit suggestions or issues through the [issues](https://github.com/ajthor/inkblot/issues) tab.
