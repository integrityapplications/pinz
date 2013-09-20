var mongo = require('mongodb');
var express = require('express');
var async = require('async');

var mongoUrl = "mongodb://localhost:27017/observabledb";

mongo.connect(mongoUrl , function(err, db) {
	
	if(err) throw err;
	console.log("Connected to mongoDB @ " + mongoUrl);
	
	GLOBAL.dbHandle = db;
	
	start(3000);
});

function start(port) {
	var app = express();

	app.use(express.bodyParser());
	app.use('/ngapp', express.static(__dirname+'/ngapp'));
	app.use('/static', express.static(__dirname+'/public'));

	app.post('/data', processRequest);
	
	app.listen(3000);
	console.log('Listening on port 3000');
}


function processRequest(req, res) {
	var queries = req.body;
	var results = [];
	async.forEach(queries, function(query, callback) {
		GLOBAL.dbHandle.collection(query.src).find({}).toArray(function(err , docs) {
			if (err) callback(err);
			results.push(docs);
			callback();
		});
	}, function(err) {
		if (err) {
			//return 500
		}
		res.send(results);
	});
}
