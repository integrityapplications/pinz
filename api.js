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

	var results = [];
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
		}
		
	}, function(err) {
		if (err) {
			res.send(err.status, err.msg);
		} else {
			res.send(200, results);
		}
	});
}

function processMetadataRequest(req, res) {
	GLOBAL.dbHandle.collection('metadata').find().toArray(function(err , docs) {
		if (err) {
			res.send(err.status, err);
		} else {
			res.json(docs);
		}
	});
}

module.exports.processDataRequest=processDataRequest;
module.exports.processMetadataRequest=processMetadataRequest;
