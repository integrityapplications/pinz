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

	var results = [];
	async.forEach(inputs, function(input, callback) {
		try {
			var query = queryBuilder.buildMongoQuery(input);
			GLOBAL.dbHandle.collection(input.src).find(query).toArray(function(err , docs) {
				if (err) callback({status:500, msg:"Server Error"});
				results = results.concat(docs);
				callback();
			});
		} catch(e) {
			console.log(JSON.stringify(e, null, ""))
			callback({status:400, msg:"Bad Request"});
		}
	}, function(err) {
		if (err) {
			res.send(err.status, err.msg);
		} else {
			res.send(results);
		}
	});
}

module.exports.processDataRequest=processDataRequest