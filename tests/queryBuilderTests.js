var assert = require('assert');

var queryBuilder = require('./../queryBuilder');

describe( 'queryBuilder' , function() {
	it('queryBuilder should return valid MongoDB query' , function() {
		assert.equal("test" , queryBuilder.buildTimeQuery() );
	});
});