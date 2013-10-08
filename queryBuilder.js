var ObjectID = require('mongodb').ObjectID;

module.exports.buildGeoWithinQuery=buildGeoWithinQuery
module.exports.buildTimeInsertedQuery=buildTimeInsertedQuery
module.exports.buildTimeQuery=buildTimeQuery
module.exports.buildMongoQuery=buildMongoQuery
module.exports.buildAttributeQuery=buildAttributeQuery

function buildTimeQuery(time) {
	if (!('start' in time)) throw new Error("Required property start not provided");
	if( !('end' in time) ) throw new Error("Required property end not provided");
	
	var start = new Date(time.start);
	if (isNaN(start.getTime())) {
		throw new Error("Invalid date format, expecting: 'yyyy-mm-ddTHH:MM:SS', you provided: " + time.start);
	}

	var end = new Date(time.end);
	if (isNaN(end.getTime())) {
		throw new Error("Invalid date format, expecting: 'yyyy-mm-ddTHH:MM:SS', you provided: " + time.end);
	}

	return { 
		$gte : start , 
		$lte : end 
	};
}

function buildTimeInsertedQuery(time){
	if (!('start' in time)) throw new Error("Required property start not provided");

	var start = new Date(time.start);
	if (isNaN(start.getTime())) {
		throw new Error("Invalid date format, expecting: 'yyyy-mm-ddTHH:MM:SS', you provided: " + time.start);
	}

	var end = null; // end is an optional parameter
	if( ('end' in time) ) {
		end = new Date(time.end);
		if (isNaN(end.getTime())) {
			throw new Error("Invalid date format, expecting: 'yyyy-mm-ddTHH:MM:SS', you provided: " + time.end);
		}
	}

	var query = {};
	if (start) query.$gte = objectIdFromDate(start);
	if (end) query.$lte = objectIdFromDate(end);
	return query;
}

function buildGeoWithinQuery(coords) {
	if (coords.length % 2 !== 0)  throw new Error("Coordinates array contains odd number of values, lat/lon pairs required");
	if (coords.length <= 6)  throw new Error("Coordinates array does not contain enough points to define closed polygon");
	if (coords[0] !== coords[coords.length-2] 
		&& coords[1] !== coords[coords.length-1])  throw new Error("Coordinates array does not define closed polygon, first and last point are not the same");

	var outerRing = [];
	for (var i=0; i<coords.length; i+=2) {
		var lat = coords[i];
		var lon = coords[i+1];
		outerRing.push([lon, lat]);
	}

	return {
			"$geoWithin" : {
				"$geometry" : {
					"type" : "Polygon" ,
					"coordinates" : [ 
						outerRing
					]
				}
			}
		};
}

function buildAttributeQuery( attr ) {

	if(attr == null) throw new Error("Attribute data is null");

	key = attr.k;
	value = null;
	if (attr.v instanceof Array) {
		value = {$in: attr.v};
	} else {
		value = attr.v;
	}

	return { 
		$elemMatch : 
		{
			k : key, 
			v : value
		}
	};
}


function buildMongoQuery(query) {

	var mongoQuery = {};

	if('time_inserted' in query) mongoQuery._id = buildTimeInsertedQuery(query.time_inserted);
	if('time_within' in query) mongoQuery.t = buildTimeQuery(query.time_within);
	if('geo_within' in query) mongoQuery["geos.loc"] = buildGeoWithinQuery(query.geo_within);
	
	console.log("\tBuilt Mongo query = " + JSON.stringify(mongoQuery, null, "").split("\n").join("") );
	
	return mongoQuery
}

function objectIdFromDate(date) {
	var seconds = Math.floor(date.getTime()/1000);
	//http://mongodb.github.io/node-mongodb-native/api-bson-generated/objectid.html
	return ObjectID.createFromTime(seconds);
}

