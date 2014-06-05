/* global describe, it, beforeEach, expect, should, assert, require */

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

var module = require('/Users/adam/Dropbox/inkblot/bin/utils/splice.js');



describe('splice object', function() {

    var splice = module;

    it('should exist', function() {
        expect(splice).to.exist;
    });

    describe('splice function', function() {

        var spliceFunc = splice.splice;

        it('should exist', function() {
            expect(spliceFunc).to.exist;
        });

    });

});