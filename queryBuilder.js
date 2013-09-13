module.exports.buildTimeQuery=buildTimeQuery


function buildTimeQuery(time) {
	if (!('start' in time)) throw new Error("Required property start not provided");
	
	if( !('end' in time) ) throw new Error("Required property end not provided");
	
	return "test";
}



