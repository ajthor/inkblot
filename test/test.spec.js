/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

'use strict';

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

describe('exported object', function() {

    var exported = require('/Users/adam/Dropbox/inkblot/bin/utils/test.js');

    it('should not be undefined', function() {
        expect(exported).to.not.be.undefined;
    });

    describe('testJs function', function() {

        var testJs = exported;

        it('should exist', function() {
            expect(testJs).to.exist;
        });

        describe('testJs.prototype', function() {

            var testJsProto = testJs.prototype;

            describe('initialize', function() {

                var initialize = testJsProto.initialize;

                it('should exist', function() {
                    expect(initialize).to.exist;
                });

            });

            describe('getVariables', function() {

                var getVariables = testJsProto.getVariables;

                it('should exist', function() {
                    expect(getVariables).to.exist;
                });

            });

            describe('variable', function() {

                var variable = testJsProto.variable;

                it('should exist', function() {
                    expect(variable).to.exist;
                });

            });

        });

    });
});