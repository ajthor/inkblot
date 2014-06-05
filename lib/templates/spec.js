/* global describe, it, beforeEach, afterEach, before, after */
/* global expect, should, assert, require */

var chai = require('chai'),
	expect = chai.expect,
	assert = chai.assert,
	should = chai.should();

describe('exported object', function () {

	var exported;

	it('should load without throwing', function () {
		expect(function () {
			exported = require('<%= path %>');
			
		}).to.not.throw();
	});

<%= code %>});
