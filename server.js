var mongo = require('mongodb');
var express = require('express');
var async = require('async');
var queryBuilder = require('./queryBuilder');

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

  app.post('/data', processRequest);
  
  app.listen(portnum);
  console.log('Listening on port ' + portnum);
}

function processRequest(req, res) {
  var inputs = req.body;
  var results = [];
  async.forEach(inputs, function(input, callback) {
    try {
      var query = queryBuilder.buildMongoQuery(input);
      GLOBAL.dbHandle.collection(input.src).find(query).toArray(function(err , docs) {
	if (err) callback({status:500, msg:"Server Error"});
	results = results.concat(docs);
	callback();
      });
    } catch(e) {
      //console.log(JSON.stringify(e, null, ""))
      callback({status:400, msg:"Bad Request"});
    }
  }, function(err) {
      if (err) {
	res.send(err.status, err.msg);
      } else {
	res.send(results);
      }
    });
}
