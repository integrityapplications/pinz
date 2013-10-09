var async = require('async');
var mongo = require('mongodb');
var request = require('request');
var xml2js = require('xml2js');
var usgs =  require('./usgsObservable');

var mongoUrl = "mongodb://localhost:27017/observabledb";

mongo.connect(mongoUrl , function(err, db) {
	if(err) {
		console.log("Unable to connect to mongo, mongoUrl: " + mongoUrl);
		console.log("Error: " + JSON.stringify(err, null, ""));
		process.exit(1);
	}
  
	console.log("Connected to mongoDB @ " + mongoUrl);
	GLOBAL.dbHandle = db;

	pollAtomFeed(db);
	setInterval(function() {
		pollAtomFeed();
	}, 300000);
});


function pollAtomFeed(db) {
	var atomXml = null;
	var earthquakes = [];
	console.log("polling server for data...");
	async.series([
		//Make HTTP request
		function(callback) {
			request('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.atom', function (error, response, body) {
				if (response.statusCode !== 200) {
					callback("Unable to HTTP GET earthquakes, status: " +  response.statusCode + ", error: " + error);
				} else {
					atomXml = body;
					callback();
				}
			});
		},
		//Parse XML into json and convert to observables
		function(callback) {
			xml2js.parseString(atomXml, function (err, result) {
				if (err) {
					callback("Unable to parse Atom XML response, err: " + err);
				} else {
					//console.log(JSON.stringify(result, null, "\t"));
					console.log("Found " + result.feed.entry.length + " earthquakes");
					result.feed.entry.forEach(function (entry, index) {
						var earthquake = usgs.createQuakeObservable(entry);
						earthquakes.push(earthquake);
						//console.log(JSON.stringify(entry, null, "\t"));
					});
					callback();
				}
			});
		},
		//write earthquake observables to database
		function(callback) {
			async.forEach(earthquakes, function(earthquake, insertCallback) {
				console.log(JSON.stringify(earthquake, null, "\t"));
				//TODO insert me into database please!
				db.collection("earthquake").insert(earthquake , function(err, objects) {
					if(err) {
						console.log("WARN :: Error persisting earthquake observable::\n" + JSON.stringify(earthquake , null, 4));
					} else {
						console.log("INFO :: Successfully persisted earthquake observable");
					}
				});

				insertCallback();
			}, function(err) {
				callback();
			});
		}
	], function(err) {
		if (err) console.log(err);
		console.log("Next polling inverval in 5 minutes. Sit tight...");
    });
}
