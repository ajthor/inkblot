/* global describe, it, beforeEach, expect, should, assert, require */

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

var module = require('/Users/adam/Dropbox/inkblot/bin/utils/test.js');



describe('test function', function() {

    var test = module;

    it('should exist', function() {
        expect(test).to.exist;
    });

    describe('test.prototype', function() {

        var testProto = test.prototype;

        describe('initialize', function() {

            var initialize = testProto.initialize;

            it('should exist', function() {
                expect(initialize).to.exist;
            });

        });

        describe('getVariables', function() {

            var getVariables = testProto.getVariables;

            it('should exist', function() {
                expect(getVariables).to.exist;
            });

        });

        describe('variable', function() {

            var variable = testProto.variable;

            it('should exist', function() {
                expect(variable).to.exist;
            });

        });

    });

});