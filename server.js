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
	
	app.post('/hello.txt', processRequest);
	
	app.listen(3000);
	console.log('Listening on port 3000');
}


function processRequest(req, res) {
	//res.send(req.body);
	GLOBAL.dbHandle.collection("A").find( {}).toArray(function(err , docs) {
		res.send(docs);
	});
}
