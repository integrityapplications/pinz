var mongoClient = require('mongodb');
var stomp = require('stomp-client');
var msgProcessor = require('./msgProcessor');

var mongoUrl = 'mongodb://localhost:27017/pinz';
var destinations = [
	{
		destination: '/topic/myDataTopic',
		host: '0.0.0.0',
		port: 61613,
		username: 'user1',
		password: 'pw1'
	}
];

mongoClient.connect(mongoUrl, function(error, db) {
	if(error) throw error;

	console.log("Successfully connected to mongo at " + mongoUrl);
	GLOBAL.dbHandle = db;

	destinations.forEach(function(d, index) {
		var client = new stomp(d.host, d.port, d.username, d.password);
		client.connect(function(sessionId) {
			console.log('Successfully connected to JMS[host:' + d.host + ', port:' + d.port + ', destination:' + d.destination + ']');
			client.subscribe(d.destination, function(body, headers) {
				msgProcessor.processMsg(body, headers);
			});
		}, function (jmsErr) {
			console.log('Unable to connect to JMS[host:' + d.host + ', port:' + d.port + ', destination:' + d.destination + '], error: ' + jmsErr);
		});
	});

	setInterval(
		function() {msgProcessor.publishMsgs();},
		10000
	);
});
