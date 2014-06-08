/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

'use strict';

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

describe('exported object', function() {

    var exported = require('/Users/adam/Dropbox/inkblot/bin/inkblot.js');

    it('should not be undefined', function() {
        expect(exported).to.not.be.undefined;
    });

    describe('inkblotJs function', function() {

        var inkblotJs = exported;

        it('should exist', function() {
            expect(inkblotJs).to.exist;
        });

        describe('inkblotJs.prototype', function() {

            var inkblotJsProto = inkblotJs.prototype;

            describe('scaffold', function() {

                var scaffold = inkblotJsProto.scaffold;

                it('should exist', function() {
                    expect(scaffold).to.exist;
                });

            });

            describe('splice', function() {

                var splice = inkblotJsProto.splice;

                it('should exist', function() {
                    expect(splice).to.exist;
                });

            });

            describe('spliceTests', function() {

                var spliceTests = inkblotJsProto.spliceTests;

                it('should exist', function() {
                    expect(spliceTests).to.exist;
                });

            });

            describe('generate', function() {

                var generate = inkblotJsProto.generate;

                it('should exist', function() {
                    expect(generate).to.exist;
                });

            });

            describe('log', function() {

                var log = inkblotJsProto.log;

                it('should exist', function() {
                    expect(log).to.exist;
                });
                it('should output nothing if the \'silent\' option is passed', function() {});

            });

            describe('run', function() {

                var run = inkblotJsProto.run;

                it('should exist', function() {
                    expect(run).to.exist;
                });

            });

            describe('compile', function() {

                var compile = inkblotJsProto.compile;

                it('should exist', function() {
                    expect(compile).to.exist;
                });

                it('should fail if passed a path', function() {
                    expect(function() {

                        compile('/some/path.js', function(err) {
                            if (err) {
                                throw err;
                            }
                        });

                    }).to.throw(Error);
                });
                it('should fail if passed a Buffer', function() {
                    expect(function() {

                        compile(new Buffer('Hello, world!'), function(err) {
                            if (err) {
                                throw err;
                            }
                        });

                    }).to.throw(Error);
                });

            });

        });

    });
});