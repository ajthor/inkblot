/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

describe('exported object', function() {

    var exported = require('/Users/adam/Dropbox/inkblot/bin/utils/wiring.js');

    it('should not be undefined', function() {
        expect(exported).to.not.be.undefined;
    });

    describe('wiringJs object', function() {

        var wiringJs = exported;

        it('should exist', function() {
            expect(wiringJs).to.exist;
        });

        describe('getInnerBlock function', function() {

            var getInnerBlock = wiringJs.getInnerBlock;

            it('should exist', function() {
                expect(getInnerBlock).to.exist;
            });

        });

        describe('getOuterBlock function', function() {

            var getOuterBlock = wiringJs.getOuterBlock;

            it('should exist', function() {
                expect(getOuterBlock).to.exist;
            });

        });

        describe('appendToBlock function', function() {

            var appendToBlock = wiringJs.appendToBlock;

            it('should exist', function() {
                expect(appendToBlock).to.exist;
            });

        });

    });
});