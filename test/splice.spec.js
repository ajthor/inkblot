/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

'use strict';

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

describe('exported object', function() {

    var exported = require('/Users/adam/Dropbox/inkblot/bin/utils/splice.js');

    it('should not be undefined', function() {
        expect(exported).to.not.be.undefined;
    });

    describe('spliceJs object', function() {

        var spliceJs = exported;

        it('should exist', function() {
            expect(spliceJs).to.exist;
        });

        describe('splice function', function() {

            var splice = spliceJs.splice;

            it('should exist', function() {
                expect(splice).to.exist;
            });

        });

    });
});