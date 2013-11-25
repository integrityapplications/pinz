var async = require('async');
var mongo = require('mongodb');
var request = require('request');
var xml2js = require('xml2js');
var usgs =  require('./usgsObservable');

var mongoUrl = "mongodb://localhost:27017/pinz";

mongo.connect(mongoUrl , function(err, db) {
	if(err) {
		console.log("Unable to connect to mongo, mongoUrl: " + mongoUrl);
		console.log("Error: " + JSON.stringify(err, null, ""));
		process.exit(1);
	}
  
	console.log("Connected to mongoDB @ " + mongoUrl);
	GLOBAL.dbHandle = db;

	insertMetadataDoc();

	pollAtomFeed('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.atom');
	setInterval(function() {
		pollAtomFeed('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.atom');
	}, 300000);
});


function pollAtomFeed(url) {
	var atomXml = null;
	var earthquakes = [];
	console.log("polling server for data...");
	async.series([
		//Make HTTP request
		function(callback) {
			request(url, function (error, response, body) {
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
				GLOBAL.dbHandle.collection("earthquake").update({id:earthquake.id}, earthquake, {upsert: true}, function(err, objects) {
					if(err) {
						insertCallback("Unable to insert earthquake " + earthquake.id);
					} else {
						insertCallback();
					}
				});
			}, function(err) {
				callback(err);
			});
		}
	], function(err) {
		if (err) console.log(err);
		console.log("Next polling inverval in 5 minutes. Sit tight...");
    });
}

function insertMetadataDoc() {
	var metadataDoc = {
		_id : "earthquake" ,
		desc : "Human readable data definition for source A - what it is, where it comes from, kind of info it contains.",
		attrs : [
			{
				name : "title" ,
				type : "string"
			} ,
			{
				name : "magnitude" ,
				type : "number"
			}
		]
	}
	console.log("Adding earthquake metadata document");
	GLOBAL.dbHandle.collection("metadata").update({_id:"earthquake"}, metadataDoc, {upsert: true}, function(err, objects) {
		if(err) {
			console.log("Unable to insert metadata document");
		}
	});
}
