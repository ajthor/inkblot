# Inkblot TODO

## Roadmap

I believe I have changed my opinion about what tests I should generate using inkblot. Inkblot should scaffold unit tests based on the output of Node.js modules automatically, meaning that it should traverse the object output by the module and generate a spec based on that object. Then, any other test defined in the file in the comments should be scaffolded out, too, and set to fail somehow. Or, rather, to simply define the space for that test to happen. The user can then define the custom tests they want to make later. Perhaps the best way to do this is via an '--auto' option. This way, the user knows how many tests they should write in order to get 100% code coverage on their modules.

A typical workflow would then look like this: 
1. write the basic skeleton, including all functions and arguments
2. run inkblot
3. write tests for functions
4. write code for tests
5. write another skeleton

This way, the user can define the behavior using the inkblot comments during the definition of the function, and then write tests to complement the function itself.

## TODO

- Better define the variable setup in the unit tests. Perhaps use the object output by the module to verify variables.
- Files are already scaffolded using comments. Perhaps scaffold them also using the module output itself.
- Save test configuration to JSON file, along with the test interpretation of the module. This way, if a user compiles the tests and then adds another one via comments, it will simply add the test to the spec rather than rewriting the old spec and perhaps lose comments. Doesn't really help with user-defined tests unless the program were to traverse the describe 'tree' and append new tests to describe blocks if they do not already exist.
- Add 'test block' function. Basically, using block comments '/* ... */', the user can write their test directly inside the comment block and have it transferred to the spec file during compilation. Perhaps best would be to define a syntax for starting and ending the test block rather than placing it within a block quote. so perhaps: 

    //tblock IT should do something
    
    expect(true).toBe(true);

    //tblock END

Would produce:

    it('should do something', function() {
        expect(true).toBe(true);
    });

- Add '-f' or '--force' option to completely redo the spec when run.