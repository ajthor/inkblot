/* global describe, it, beforeEach, expect, should, assert, require */

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

var module = require('/Users/adam/Dropbox/inkblot/bin/utils/wiring.js');



describe('wiring object', function() {

    var wiring = module;

    it('should exist', function() {
        expect(wiring).to.exist;
    });

    describe('getInnerBlock function', function() {

        var getInnerBlock = wiring.getInnerBlock;

        it('should exist', function() {
            expect(getInnerBlock).to.exist;
        });

    });

    describe('getOuterBlock function', function() {

        var getOuterBlock = wiring.getOuterBlock;

        it('should exist', function() {
            expect(getOuterBlock).to.exist;
        });

    });

    describe('appendToBlock function', function() {

        var appendToBlock = wiring.appendToBlock;

        it('should exist', function() {
            expect(appendToBlock).to.exist;
        });

    });

});