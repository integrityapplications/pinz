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
				queryBuilder.buildTimeQuery({ "start" :  "invalid date format" , "start" : "2013-09-12T00:00:00" });
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
		it("Input should not be blank" , function() {
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
});


/*describe('buildQuery.buildMongoQuery()' , function() {

	var query = {
		"src" : "A",
		"time_within" : {
			"start" : "2013-09-13T16:00:00",
			"end" : "2013-09-13T16:00:30"
		},
		"geo_within" : [
			40.0, -55.0,
			40.0, -30.0,
			10.0, -30.0,
			10.0, -55.0,
			40.0, -55.0
		],
		"attrs" : [
			{
				"k" : "color",
				"v" : ["red" , "green"]
			},
			{
				"k" : "animal",
				"v" : ["koala"]
			},
			{
				"k" : "weight",
				"low" : 50,
				"high" : 100
			}
		]
	}

	it('mongo query should be valid JSON' , function() {
		assert.equal("" , queryBuilder.buildMongoQuery(query));
	});

});
*/