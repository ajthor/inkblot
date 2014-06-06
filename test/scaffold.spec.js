/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

describe('exported object', function() {

    var exported = require('/Users/adam/Dropbox/inkblot/bin/utils/scaffold.js');

    it('should not be undefined', function() {
        expect(exported).to.not.be.undefined;
    });

    describe('scaffoldJs object', function() {

        var scaffoldJs = exported;

        it('should exist', function() {
            expect(scaffoldJs).to.exist;
        });

        describe('scaffold function', function() {

            var scaffold = scaffoldJs.scaffold;

            it('should exist', function() {
                expect(scaffold).to.exist;
            });

        });

    });
});