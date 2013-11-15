var async 			= require('async');
var queryBuilder 	= require('./queryBuilder');

function processDataRequest(req, res) {

	var inputs = req.body;

	if (!(inputs instanceof Array)) {
		res.send(400, "Bad Request, POST body expected to contain JSON array.");
		return;
	}
	if (inputs.length === 0) {
		res.send(400, "Bad Request, POSTed JSON array expected to contain elements.");
		return;
	}
	for (var i=0; i<inputs.length; i++) {
		if (!('src' in inputs[i])) {
			res.send(400, "Bad Request, object[" + i + "] does not contain required element 'src'");
			return;
		}
	}

	var pinzJsonBoolean = false;
	if(req.headers.Accept == 'pinz-json') {
		console.log("\n\tINFO :: request header specified pinz-json.");
		pinzJsonBoolean = true;
	}

	var results = [];

	// if we asked for pinz, just do the norm
	if(pinzJsonBoolean == true) {
		async.forEach(inputs, function(input, callback) {
			var query = null;
			try {
				query = queryBuilder.buildMongoQuery(input);
			} catch(e) {
				console.log(JSON.stringify(e, null, ""));
				callback({status:400, msg:"Bad Request"});
			}
			if (query) {
				GLOBAL.dbHandle.collection(input.src).find(query).limit(5000).toArray(function(err , docs) {
					if (err) {
						callback({status:500, msg:"Server Error"});
					} else {
						results = results.concat(docs);
						callback();
					}
				});

				if ('true' === req.headers['pinz-debug-query']) {
					GLOBAL.dbHandle.collection(input.src).find(query).limit(5000).explain(function(err , results) {
						console.log("Query: " + JSON.stringify(query, null, ' '));
						console.log("Explain: " + JSON.stringify(results, null, ' '));
					});
				}
			}
			
		}, function(err) {
			if (err) {
				res.send(err.status, err.msg);
			} else {
				res.send(200, results);
			}
		});

	} else {
		// assume we want "regular" json
		async.forEach(inputs, function(input, callback) {
			var query = null;
			try {
				query = queryBuilder.buildMongoQuery(input);
			} catch(e) {
				console.log(JSON.stringify(e, null, ""));
				callback({status:400, msg:"Bad Request"});
			}
			if (query) {
				GLOBAL.dbHandle.collection(input.src).find(query).limit(5000).toArray(function(err , docs) {
					if (err) {
						callback({status:500, msg:"Server Error"});
					} else {
						// modify in place
						convertPinzObsArrayToRegularJson(docs);
						results = results.concat(docs);
						callback();
					}
				});

				if ('true' === req.headers['pinz-debug-query']) {
					GLOBAL.dbHandle.collection(input.src).find(query).limit(5000).explain(function(err , results) {
						console.log("Query: " + JSON.stringify(query, null, ' '));
						console.log("Explain: " + JSON.stringify(results, null, ' '));
					});
				}
			}
			
		}, function(err) {
			if (err) {
				res.send(err.status, err.msg);
			} else {
				res.send(200, results);
			}
		});
	}
}

function processMetadataRequest(req, res) {
	GLOBAL.dbHandle.collection('metadata').find().toArray(function(err , docs) {
		if (err) {
			res.send(err.status, err);
		} else {
			console.log('returning ', docs.length, ' docs.');
			res.json(docs);
		}
	});
}


function convertPinzObsToRegularJson(pinzObs) {
	// converts a pinz-style obs to a regular-style json obs.
	if(pinzObs == null) {
		return null;
	} else {
		regularObs = {};
		// now add obs level data, if present
		if(pinzObs["id"] != undefined) {
			regularObs.id = pinzObs["id"];
		}
		if(pinzObs["src"] != undefined) {
			regularObs.src = pinzObs["src"];
		}
		if(pinzObs["t"] != undefined) {
			regularObs.t = pinzObs["t"];
		}
		if(pinzObs["attrs"] != undefined) {

			for(var attrIdx = 0; attrIdx < pinzObs.attrs.length; attrIdx++) {		
				var attr = pinzObs.attrs[attrIdx];
				valueObs = {};

				if(attr["k"] != undefined && attr["v"] != undefined) {
					valueObs.v = attr["v"];
					if(attr["u"] != undefined) {
						valueObs.u = attr["u"];
					}
				}
				regularObs[attr["k"]] = valueObs;
			}
		}
		if(pinzObs["geos"] != undefined) {
			regularObs.geos = pinzObs["geos"];
		}
		return regularObs;
	}
}

function convertPinzObsArrayToRegularJson(pinzObsArray) {
	// Modifes input array in place.  Expects array of pinz-style observables.
	// Each obs may have id, src, t, attributes { "k" : "key" , "v" : "value" , "u" : "units"} and geos.
	if(pinzObsArray == null || pinzObsArray.length == 0) {
		console.log("\tWARNING: Input pinzJson result was either null or had no observables.  Returning null.");
		return null;
	} else {

		pinzObsArray.forEach(function(element, index, array) {
			pinzObsArray[index] = convertPinzObsToRegularJson(element);
		});
	}
}


module.exports.processDataRequest=processDataRequest;
module.exports.processMetadataRequest=processMetadataRequest;
module.exports.convertPinzObsToRegularJson=convertPinzObsToRegularJson;
module.exports.convertPinzObsArrayToRegularJson=convertPinzObsArrayToRegularJson;
