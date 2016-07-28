/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

'use strict';

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

describe('exported object', function() {

    var exported = require('../lib/inkblot.js');

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

            describe('spliceObject', function() {

                var spliceObject = inkblotJsProto.spliceObject;

                it('should exist', function() {
                    expect(splice).to.exist;
                });

            });

            describe('saveFile', function() {

                var saveFile = inkblotJsProto.saveFile;

                it('should exist', function() {
                    expect(saveFile).to.exist;
                });

            });

            describe('writeJSON', function() {

                var writeJSON = inkblotJsProto.writeJSON;

                it('should exist', function() {
                    expect(writeJSON).to.exist;
                });

            });

            describe('cleanOriginal', function() {

                var cleanOriginal = inkblotJsProto.cleanOriginal;

                it('should exist', function() {
                    expect(cleanOriginal).to.exist;
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

        it('should have default options', function() {
            var instance = new inkblotJs({});

            expect(instance.options).to.exist;
            expect(instance.options.autoReplace).to.equal(false);
            expect(instance.options.autoRemove).to.equal(true);
            expect(instance.options.enablePrompts).to.equal(true);
            expect(instance.options.silent).to.equal(false);
        });

        it('should accept options as arguments', function() {
            var instance = new inkblotJs({
                silent: true,
                foo: "bar"
            });

            expect(instance.options.silent).to.equal(true);
            expect(instance.options.foo).to.equal("bar");
        });

    });
});