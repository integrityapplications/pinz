var express = require('express');

start(3000);

function start(port) {
	var app = express();

	app.use(express.bodyParser());

	app.post('/hello.txt', function(req, res) {
		res.send(req.body);
	});

	app.listen(3000);
	console.log('Listening on port 3000');
}