module.exports.buildTimeQuery=buildTimeQuery


function buildTimeQuery(time) {
	if (!('start' in time)) throw new Error("Required property start not provided");
	if( !('end' in time) ) throw new Error("Required property end not provided");
	
	var start = new Date(time.start);
	if (isNaN(start.getTime())) {
		throw new Error("Invalid date format, expecting: 'yyyy-mm-ddTHH:MM:SS', you provided: " + time.start);
	}
	
	return "test";
}



