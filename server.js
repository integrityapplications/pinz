var mongo = require('mongodb');
var express = require('express');

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

	app.post('/hello.txt', function(req, res) {
		res.send(req.body);
	});

	app.listen(3000);
	console.log('Listening on port 3000');
}

