/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

'use strict';

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

describe('exported object', function() {

    var exported = require('../lib/utils/generate.js');

    it('should not be undefined', function() {
        expect(exported).to.not.be.undefined;
    });

    describe('generateJs object', function() {

        var generateJs = exported;

        it('should exist', function() {
            expect(generateJs).to.exist;
        });

        describe('spliceTests function', function() {

            var spliceTests = generateJs.spliceTests;

            it('should exist', function() {
                expect(spliceTests).to.exist;
            });

        });

        describe('generate function', function() {

            var generate = generateJs.generate;

            it('should exist', function() {
                expect(generate).to.exist;
            });

        });

    });
});