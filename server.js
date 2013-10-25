var mongo = require('mongodb');
var argv = require('optimist').argv;
var express = require('express');
var api = require('./api');
var cors = require('cors');  // CORS - cross-origin resource sharing

var mongoHost = "";
var portNumber = null;
var serverPort = null;

if(argv.mongoHost) {
  mongoHost = argv.mongoHost;
} else {
  mongoHost = "localhost";
}

if(argv.mongoPort) {
  mongoPort = argv.mongoPort;
} else {
  mongoPort = 27017;
}

if(argv.serverPort) {
  serverPort = argv.serverPort;
} else {
  serverPort = 3000;
}

var mongoUrl = "mongodb://" + mongoHost + ":" + mongoPort + "/observabledb";


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

// CORS module config
var corsOptions = {
  // Access-Control-Allow-Origin - defines those domains from which javascript can access server resources.  
  // Generally, Access-Control-Allow-Origin:* is frowned upon; also does not allow requests to supply credentials, nor does it allow cookies to be sent.
  // Access-Control-Allow-Origin: http://foo.example
  // Access-Control-Allow-Methods: POST, GET, OPTIONS
  // Access-Control-Allow-Headers
  
  origin : '*' ,
  methods : [ 'GET' , 'POST' ]

};



function start(port) {

  var app = express();

  app.use(express.bodyParser());
  app.use('/ngapp', express.static(__dirname+'/ngapp'));
  app.use('/static', express.static(__dirname+'/static'));
  app.get('/metadata', api.processMetadataRequest);
	app.post('/data', cors(corsOptions), api.processDataRequest);
	
	app.listen(port);
  console.log();
  console.log('Listening on port ' + port);
}