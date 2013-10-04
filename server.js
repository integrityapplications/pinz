var mongo = require('mongodb');
var express = require('express');
var api = require('./api');

// todo: make the portnum an option
var mongoUrl = "mongodb://localhost:27017/observabledb";
// todo: make portnum an option
var portnum = 3000

mongo.connect(mongoUrl , function(err, db) {
  
  if(err) throw err;
  console.log("Connected to mongoDB @ " + mongoUrl);
  
  GLOBAL.dbHandle = db;
  
  start(portnum);
});

function start(port) {
  var app = express();

  app.use(express.bodyParser());
  app.use('/ngapp', express.static(__dirname+'/ngapp'));
  app.use('/static', express.static(__dirname+'/static'));

	app.post('/data', api.processDataRequest);
	
	app.listen(portnum);
  console.log('Listening on port ' + portnum);
}