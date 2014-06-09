/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

'use strict';

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

describe('exported object', function() {

    var exported = require('../bin/utils/splice.js');

    it('should not be undefined', function() {
        expect(exported).to.not.be.undefined;
    });

    describe('spliceJs object', function() {

        var spliceJs = exported;

        it('should exist', function() {
            expect(spliceJs).to.exist;
        });

        describe('spliceObject function', function() {

            var spliceObject = spliceJs.spliceObject;

            it('should exist', function() {
                expect(spliceObject).to.exist;
            });

        });

        describe('saveFile function', function() {

            var saveFile = spliceJs.saveFile;

            it('should exist', function() {
                expect(saveFile).to.exist;
            });

        });

        describe('writeJSON function', function() {

            var writeJSON = spliceJs.writeJSON;

            it('should exist', function() {
                expect(writeJSON).to.exist;
            });

        });

        describe('cleanOriginal function', function() {

            var cleanOriginal = spliceJs.cleanOriginal;

            it('should exist', function() {
                expect(cleanOriginal).to.exist;
            });

        });

        describe('splice function', function() {

            var splice = spliceJs.splice;

            it('should exist', function() {
                expect(splice).to.exist;
            });

        });

    });
});