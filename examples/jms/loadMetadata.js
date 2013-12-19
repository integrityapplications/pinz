var mongo = require('mongodb');
var fs = require('fs');
var argv = require('optimist').argv;
var async = require('async');

var mongoUrl = "mongodb://localhost:27017/pinz";
if(argv.mongoUrl) mongoUrl = argv.mongoUrl;

var processed = 0;
var files = [];
if(argv.files) files = argv.files.split(",");
if(files.length === 0) {
	console.log("No files to process.\nUsage --files=doc1.json,doc2.json,doc3.json");
	process.exit(0);
}

mongo.connect(mongoUrl, function(err, db) {
	if(err) {
		console.log("Unable to connect to mongo at " + mongoUrl);
		console.log("Error: " + JSON.stringify(err, null, " "));
		process.exit(1);
	}

	console.log("Connected to mongoDB @ " + mongoUrl);
	files.forEach(function(file) {
		processFile(file, db, updateProcessed);
	});
});

function processFile(fileName, db, callback) {
	fs.readFile(fileName, function(err, data) {
		if (err) {
			callback("Unable to load file " + fileName + ", error: " + err);
		} else {
			try {
				var doc = JSON.parse(data);
				db.collection("metadata").update({_id:doc._id}, doc, {upsert:true}, function(mongoErr, results) {
					if(mongoErr) {
						callback("Unable to store metadata document in mongo, Error: " + mongoErr);
					} else {
						callback("Successfully published metadata document " + doc._id);
					}
				});
			} catch (e) {
				callback("Unable to parse file " + fileName + " as JSON, Exception: " + e);
			}
		}
	});
}

function updateProcessed(msg) {
	console.log(msg);
	processed++
	if (processed === files.length) process.exit();
}