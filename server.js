var mongo = require('mongodb');
var argv = require('optimist').argv;
var express = require('express');
var api = require('./api');

var mongoUrl = "mongodb://localhost:27017/pinz";
if(argv.mongoUrl) mongoUrl = argv.mongoUrl;

var serverPort = 3000;
if(argv.serverPort) serverPort = argv.serverPort;

mongo.connect(mongoUrl , function(err, db) {  
  if(err) {
    console.log("Unable to connect to mongo, mongoUrl: " + mongoUrl);
    console.log("Error: " + JSON.stringify(err, null, ""));
    process.exit(1);
  }
  
  console.log("Connected to mongoDB @ " + mongoUrl);
  GLOBAL.dbHandle = db;
  
  start(serverPort);
});

function start(port) {
  var app = express();

  app.use(express.bodyParser());
  app.use('/ngapp', express.static(__dirname+'/ngapp'));
  app.use('/static', express.static(__dirname+'/static'));

  app.get('/metadata', api.processMetadataRequest);
	app.post('/data', api.processDataRequest);
	
	app.listen(port);
  console.log();
  console.log('Listening on port ' + port);
}