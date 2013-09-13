var assert = require('assert');

var queryBuilder = require('./../queryBuilder');


describe( 'queryBuilder.buildTimeQuery()' , function() {
	
	it('queryBuilder should return valid MongoDB query' , function() {
		assert.equal("test" , queryBuilder.buildTimeQuery({ "start" :  "2013-09-12T00:00:00", "end" : "2013-09-12T12:00:00" }) );
	});
	
	it('expected member start not provided', function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeQuery({ "end" : "2013-09-12T00:00:00" });
			},
			Error
		);
	})
	
	it('expected member end not provided', function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeQuery({ "start" : "2013-09-12T00:00:00" });
			},
			Error
		);
	})
	
	it('invalid date format: start', function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeQuery({ "start" :  "invalid date format" , "end" : "2013-09-12T12:00:00" });
			},
			Error
		);
	})
	
});