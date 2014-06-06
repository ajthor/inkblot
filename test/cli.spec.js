/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

'use strict';

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

describe('exported object', function() {

    var exported = require('/Users/adam/Dropbox/inkblot/bin/cli.js');

    it('should not be undefined', function() {
        expect(exported).to.not.be.undefined;
    });

    describe('cliJs object', function() {

        var cliJs = exported;

        it('should exist', function() {
            expect(cliJs).to.exist;
        });

    });
});