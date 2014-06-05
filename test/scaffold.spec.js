/* global describe, it, beforeEach, expect, should, assert, require */

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

var module = require('/Users/adam/Dropbox/inkblot/bin/utils/scaffold.js');



describe('scaffold object', function() {

    var scaffold = module;

    it('should exist', function() {
        expect(scaffold).to.exist;
    });

    describe('scaffold function', function() {

        var scaffoldFunc = scaffold.scaffold;

        it('should exist', function() {
            expect(scaffoldFunc).to.exist;
        });

    });

});