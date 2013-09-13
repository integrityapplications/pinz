var assert = require('assert');

var queryBuilder = require('./../queryBuilder');

var time = {
		start : "",
		end: ""
}

describe( 'queryBuilder.buildTimeQuery()' , function() {
	it('queryBuilder should return valid MongoDB query' , function() {
		assert.equal("test" , queryBuilder.buildTimeQuery(time) );
	});
	
	it('expected member start not provided', function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeQuery({});
			},
			Error
		);
		
	})
});