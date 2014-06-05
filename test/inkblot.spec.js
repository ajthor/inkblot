/* global describe, it, beforeEach, expect, should, assert, require */

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

var module = require('/Users/adam/Dropbox/inkblot/bin/inkblot.js');



describe('inkblot function', function() {

    var inkblot = module;

    it('should exist', function() {
        expect(inkblot).to.exist;
    });

    describe('inkblot.prototype', function() {

        var inkblotProto;

        describe('scaffold', function() {

            var scaffold;

            it('should exist', function() {
                expect(scaffold).to.exist;
            });

        });

        describe('splice', function() {

            var splice;

            it('should exist', function() {
                expect(splice).to.exist;
            });

        });

        describe('generate', function() {

            var generate;

            it('should exist', function() {
                expect(generate).to.exist;
            });

        });

        describe('spliceTests', function() {

            var spliceTests;

            it('should exist', function() {
                expect(spliceTests).to.exist;
            });

        });

        describe('run', function() {

            var run;

            it('should exist', function() {
                expect(run).to.exist;
            });

        });

        describe('compile', function() {

            var compile;

            it('should exist', function() {
                expect(compile).to.exist;
            });

        });

    });

});