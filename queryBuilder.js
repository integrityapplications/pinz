module.exports.buildGeoWithinQuery=buildGeoWithinQuery
module.exports.buildTimeQuery=buildTimeQuery
module.exports.buildMongoQuery=buildMongoQuery


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


function buildTimeInsertedQuery(){
	// funciton to query the time data was entered into the DB
	
}


function buildGeoWithinQuery(coords) {
	if (coords.length % 2 !== 0)  throw new Error("Coordinates array contains odd number of values, lat/lon pairs required");
	if (coords.length <= 6)  throw new Error("Coordinates array does not contain enough points to define closed polygon");
	if (coords[0] !== coords[coords.length-2] 
		&& coords[1] !== coords[coords.length-1])  throw new Error("Coordinates array does not definen closed polygon, first and last point are not the same");

	var outerRing = [];
	for (var i=0; i<coords.length; i+=2) {
		var lat = coords[i];
		var lon = coords[i+1];
		outerRing.push([lon, lat]);
	}

	return {
		$geoWithin : {
			$geometry : {
				type : "Polygon" ,
				coordinates : [ 
					outerRing
				]
			}
		}
	};
}



function buildMongoQuery(query) {

	console.log("\tINFO: Building mongo query function...");
	var mongoQuery = {}

	if('time_within' in query) mongoQuery.t = buildTimeQuery(query.time_within)
	if('geo_within' in query) mongoQuery.geos = buildGeoWithinQuery(query.geo_within)
	
	console.log( JSON.stringify(mongoQuery, null, "").split("\n").join("") );
	
	return mongoQuery
}
