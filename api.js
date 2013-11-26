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
		} catch(queryBuilderError) {
			console.log("Unable to build query, Exception: " + queryBuilderError.message);
			callback({status:400, msg:"Bad Request, " + queryBuilderError.message});
		}
		if (query) {
			GLOBAL.dbHandle.collection(input.src).find(query).limit(1000).toArray(function(err , docs) {
				if (err) {
					console.log("Unable to query Mongo collection: " + input.src + ", Exception: " + err);
					callback({status:500, msg:"Server Error"});
				} else {
					if(req.headers.Accept !== 'pinz-json') {
						docs.forEach(function(nativeDoc, index) {
							convertPinzObsToRegularJson(nativeDoc);
						});
					}
					results = results.concat(docs);
					callback();
				}
			});

			if ('true' === req.headers['pinz-debug-query']) {
				GLOBAL.dbHandle.collection(input.src).find(query).limit(1000).explain(function(err , results) {
					console.log("request body ", req.body);
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

function processMetadataRequest(req, res) {
	var results = [];
	async.series([
		function(callback) {
			GLOBAL.dbHandle.collection('metadata').find().toArray(function(err , docs) {
				if (err) {
					callback({status:500, msg:"Server Error"});
				} else {
					results = docs;
					callback();
				}
			});
		},
		function(callback) {
			augmentMetadata(results, callback)
		}
	], function(err) {
		if (err) {
			res.send(err.status, err.msg);
		} else {
			res.json(results);
		}
    });
}

function augmentMetadata(docs, callback) {
	async.forEach(docs, function(doc, forEachCallback) {
		async.series([
			//Augment metadata document with timestamp of oldest observable in collection
			function(augmentCallback) {
				GLOBAL.dbHandle.collection(doc._id).find().sort({t: 1}).limit(1).toArray(function(err , results) {
					if (!err) doc.oldest = results[0].t;
					augmentCallback();
				});
			},
			//Augment metadata document with timestamp of newest observable in collection
			function(augmentCallback) {
				GLOBAL.dbHandle.collection(doc._id).find().sort({t: -1}).limit(1).toArray(function(err , results) {
					if (!err) doc.newest = results[0].t;
					augmentCallback();
				});
			},
			//Augment metadata document with number of observables in collection
			function(augmentCallback) {
				GLOBAL.dbHandle.collection(doc._id).find().count(function (err, count) {
					if (!err) doc.count = count;
					augmentCallback();
				});
			}
		], function(err) {
			forEachCallback(err)
		});
	}, function(err) {
		callback(err);
	});
}

function convertPinzObsToRegularJson(nativeDoc) {
	var attrs = {};
	for(var attrIdx = 0; attrIdx < nativeDoc.attrs.length; attrIdx++) {		
		var nativeAttr = nativeDoc.attrs[attrIdx];
		var attr = {
			v: nativeAttr.v
		};
		if ("u" in nativeAttr) attr.u = nativeAttr.u;
		attrs[nativeAttr.k] = attr;
	}
	nativeDoc.attrs = attrs;
	return nativeDoc;
}

module.exports.processDataRequest=processDataRequest;
module.exports.processMetadataRequest=processMetadataRequest;
module.exports.convertPinzObsToRegularJson=convertPinzObsToRegularJson;