var assert = require('assert');

var queryBuilder = require('./../queryBuilder');


describe( 'queryBuilder.buildTimeQuery()' , function() {
	it('queryBuilder should return valid MongoDB query' , function() {
		var query = queryBuilder.buildTimeQuery({ "start" :  "2013-09-12T00:00:00", "end" : "2013-09-12T12:00:00" });
		assert.equal( "2013-09-12T00:00:00.000Z" , query.$gte.toISOString() );
		assert.equal( "2013-09-12T12:00:00.000Z" , query.$lte.toISOString() );
	});
	
	it('expected member start not provided', function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeQuery({ "end" : "2013-09-12T00:00:00" });
			},
			Error
		);
	});
	
	it('expected member end not provided', function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeQuery({ "start" : "2013-09-12T00:00:00" });
			},
			Error
		);
	});
	
	it('invalid date format: start', function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeQuery({ "start" :  "invalid date format" , "end" : "2013-09-12T00:00:00" });
			},
			Error
		);
	});

	it('invalid date format: end', function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeQuery({ "end" :  "invalid date format" , "start" : "2013-09-12T12:00:00" });
			},
			Error
		);
	});
});

describe('queryBuilder.buildTimeInsertedQuery()' , function() {
	it("queryBuilder should return valid MongoDB query: start only" , function(){
		var query = queryBuilder.buildTimeInsertedQuery( { "start" :  "2013-09-12T00:00:00" } );
		assert.equal(query.$gte.toHexString(), "523104000000000000000000");
	});

	it("queryBuilder should return valid MongoDB query" , function(){
		var query = queryBuilder.buildTimeInsertedQuery( { "start" :  "2013-09-12T00:00:00" , "end" :  "2013-12-12T00:00:00"} );
		assert.equal(query.$gte.toHexString(), "523104000000000000000000");
		assert.equal(query.$lte.toHexString(), "52a8fc800000000000000000");
	});

	it("Input must not be blank" , function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeInsertedQuery( { } , Error);
			}
		);
	});

	it("Input must contain 'start' property" , function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeInsertedQuery( { "end" :  "invalid date format" } , Error);
			}
		);
	});

	it("invalid date format: start" , function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeInsertedQuery( { "start" :  "invalid date format" } , Error);
			}
		);
	});

	it("invalid date format: end (optional)" , function() {
		assert.throws(
			function() {
				queryBuilder.buildTimeInsertedQuery( { "end" :  "invalid date format" } , Error);
			}
		);
	});
});

describe( 'queryBuilder.buildGeoWithinQuery()' , function() {
	it('queryBuilder should return valid MongoDB query' , function() {
		var query = queryBuilder.buildGeoWithinQuery([
			40.0, -55.0,
			40.0, -30.0,
			10.0, -30.0,
			10.0, -55.0,
			40.0, -55.0
		]);
		assert.equal(
			'{"$geoWithin":{"$geometry":{"type":"Polygon","coordinates":[[[-55,40],[-30,40],[-30,10],[-55,10],[-55,40]]]}}}', 
			JSON.stringify(query, null, "").split("\n").join(""));
	});

	it('even number coordinates required', function() {
		assert.throws(
			function() {
				queryBuilder.buildGeoWithinQuery([1 ,2 , 3, 4, 5, 6, 7]);
			},
			Error
		);
	});

	it('not enough points to define closed polygon', function() {
		assert.throws(
			function() {
				queryBuilder.buildGeoWithinQuery([1 ,2 , 3, 4, 5, 6]);
			},
			Error
		);
	});

	it('not closed polygon', function() {
		assert.throws(
			function() {
				queryBuilder.buildGeoWithinQuery([1 ,2 , 3, 4, 5, 6, 7, 8]);
			},
			Error
		);
	});

	it('query area larger than hemisphere' , function() {
		assert.throws(
			function() {
				queryBuilder.buildGeoWithinQuery([
					40.0, -100.0,
					40.0, 100.0,
					10.0, 100.0,
					10.0, -100.0,
					40.0, -100.0
				]);
			},
			Error
		);
	});
});



describe('buildQuery.buildAttributeQuery' , function() {

	it('key value' , function() {
		var input = { k : "color", v : "green"};
		var response = queryBuilder.buildAttributeQuery(input);

		assert.equal('{"$elemMatch":{"k":"color","v":"green"}}' , JSON.stringify(response, null, "").split("\n").join(""));

	});

	it('multiple values' , function() {
		var input = { k : "color", v : ["green","red"]};
		var response = queryBuilder.buildAttributeQuery(input);

		assert.equal(
			'{"$elemMatch":{"k":"color","v":{"$in":["green","red"]}}}' , 
			JSON.stringify(response, null, "").split("\n").join(""));

	});

	it('attribute range' , function() {
		var input = { k : "weight",	low : 50, high : 100}
		var response = queryBuilder.buildAttributeQuery(input);

		assert.equal(
			'{"$elemMatch":{"k":"weight","v":{"$gte":50,"$lte":100}}}' , 
			JSON.stringify(response, null, "").split("\n").join(""));
	});

	it('no value or range' , function() {
		assert.throws(
			function() {
				queryBuilder.buildAttributeQuery({k:"color"});
			},
			Error
		);
	});

});


describe('buildQuery.buildMongoQuery()' , function() {
	it('time_within' , function() {
		var input = {
			"src" : "A",
			"time_within" : {
				"start" : "2013-09-13T16:00:00",
				"end" : "2013-09-13T16:00:30"
			}
		};
		var query = queryBuilder.buildMongoQuery(input);
		assert.equal(
			'{"t":{"$gte":"2013-09-13T16:00:00.000Z","$lte":"2013-09-13T16:00:30.000Z"}}' , 
			JSON.stringify(query, null, "").split("\n").join(""));
	});

	it('time_inserted' , function() {
		var input = {
			"src" : "A",
			"time_inserted" : {
				"start" : "2013-09-13T16:00:00",
				"end" : "2013-09-13T16:00:30"
			}
		};

		var query = queryBuilder.buildMongoQuery(input);
		assert.equal(
			'{"_id":{"$gte":"523336800000000000000000","$lte":"5233369e0000000000000000"}}' , 
			JSON.stringify(query, null, "").split("\n").join(""));
	});

	it('geo_within' , function() {
		var input = {
			"src" : "A",
			"geo_within" : [
				40.0, -55.0,
				40.0, -30.0,
				10.0, -30.0,
				10.0, -55.0,
				40.0, -55.0
			]
		};

		var query = queryBuilder.buildMongoQuery(input);
		assert.equal(
			'{"geos.loc":{"$geoWithin":{"$geometry":{"type":"Polygon","coordinates":[[[-55,40],[-30,40],[-30,10],[-55,10],[-55,40]]]}}}}' , 
			JSON.stringify(query, null, "").split("\n").join(""));
	});

	it('geo_within, ignore empty array' , function() {
		var input = {
			"src" : "A",
			"geo_within" : []
		};
		var query = queryBuilder.buildMongoQuery(input);
		assert.equal(
			'{}' , 
			JSON.stringify(query, null, "").split("\n").join(""));
	});

	it('attrs' , function() {
		var input = {
			"src" : "A",
			"attrs" : [
				{
					"k" : "color",
					"v" : ["red" , "green"]
				}
			]
		};

		var query = queryBuilder.buildMongoQuery(input);
		assert.equal(
			'{"attrs":{"$all":[{"$elemMatch":{"k":"color","v":{"$in":["red","green"]}}}]}}' , 
			JSON.stringify(query, null, "").split("\n").join(""));
	});
});