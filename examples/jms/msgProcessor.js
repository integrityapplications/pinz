var obsBuilder = require('./obsBuilder');

var docs = {};

function processMsg(body, headers) {
	obsBuilder.buildObs(body, headers, function(error, doc) {
		if (error) {
			console.error('Unable to process msg, error: ' + error);
		} else {
			if (!(doc.src in docs)) {
				docs[doc.src] = [doc];
			} else {
				docs[docs.src].push(doc);
			}
		}
	});
}

function publishMsgs() {
	Object.keys(docs).forEach(function(key) {
		if (docs[key].length > 0) {
			console.log("Attempting to publish " + docs[key].length + " docs to " + key);
			GLOBAL.dbHandle.colleciton(key).insert(docs[key], function err, objects) {
				if(err) console.error("Unable to publish documents to mongo, error: " +  error);
			}
		}
	});
}

exports.processMsg=processMsg;
exports.publishMsgs=publishMsgs;