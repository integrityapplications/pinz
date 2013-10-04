var mongo = require('mongodb');
var express = require('express');
var api = require('./api');

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

	app.post('/data', api.processDataRequest);
	
	app.listen(3000);
	console.log('Listening on port 3000.  Good hunting.');
}


