var mongo = require('mongodb');
var request = require('request');
var xml2js = require('xml2js');

var mongoUrl = "mongodb://localhost:27017/observabledb";

mongo.connect(mongoUrl , function(err, db) {
	if(err) {
		console.log("Unable to connect to mongo, mongoUrl: " + mongoUrl);
		console.log("Error: " + JSON.stringify(err, null, ""));
		process.exit(1);
	}
  
	console.log("Connected to mongoDB @ " + mongoUrl);
	GLOBAL.dbHandle = db;

	pollAtomFeed();
	setInterval(function() {
		pollAtomFeed();
	}, 300000);
});

function pollAtomFeed() {
	console.log("polling server for data...");
	request('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.atom', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			xml2js.parseString(body, function (err, result) {
				if (err) {
					console.log("Unable to parse response, err: " + err);
				} else {
					//console.log(JSON.stringify(result, null, "\t"));
					console.log("Found " + result.feed.entry.length + " earthquakes");
				}
			});
		} else {
			console.log("Unable to HTTP GET earthquakes, status: " +  response.statusCode + ", error: " + error);
		}
		console.log("Next polling inverval in 5 minutes. Sit tight");
	});
}
