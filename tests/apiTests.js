var assert = require('assert');

var api = require('./../api');

describe( 'api.processDataRequest' , function() {

	// is array
	it('processsDataRequest should return a 400 response if given empty input' , function() {
		var req = {body : {} };
		var res = {
			send: function(status, message) {
				this.status = status;
				this.message = message;
			}	
		};

		api.processDataRequest(req, res);
		assert.equal( "400" , res.status); // syntax for getting to the 400 status

	});

	// // is non-empty array
	// it('processRequest should return a 400 response if given a empty JSON array' , function() {
	// 	var req = {[]};

	// 	var out = server.processRequest(req, res);

	// 	assert.equal( 400, out); // syntax for getting to the 400 status
		
	// });

	}
)
	