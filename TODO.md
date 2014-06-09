# Inkblot TODO

## Roadmap

I believe I have changed my opinion about what tests I should generate using inkblot. Inkblot should scaffold unit tests based on the output of Node.js modules automatically, meaning that it should traverse the object output by the module and generate a spec based on that object. Then, any other test defined in the file in the comments should be scaffolded out, too, and set to fail somehow. Or, rather, to simply define the space for that test to happen. The user can then define the custom tests they want to make later. Perhaps the best way to do this is via an '--auto' option. This way, the user knows how many tests they should write in order to get 100% code coverage on their modules.

A typical workflow would then look like this: 
1. write the basic skeleton, including all functions and arguments
2. run inkblot (now has failing tests)
3. update tests to make sure all 'exists' tests work
4. write tests for functions
5. write code for tests
6. write another skeleton

This way, the user can define the behavior using the inkblot comments during the definition of the function, and then write tests to complement the function itself.

## TODO

- Add '-f' or '--force' option to completely redo the spec when run.
- look into fs.openFile rather than readFile