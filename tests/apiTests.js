var assert = require('assert');
var api = require('./../api');

describe( 'api.processDataRequest', function() {

	it('Ensure POST is JSON array', function() {
		var req = {body : {} };
		var res = {
			send: function(status, message) {
				this.status = status;
				this.message = message;
			}	
		};

		api.processDataRequest(req, res);
		assert.equal("400" , res.status);
	});

	it('Ensure POST JSON array is not empty', function() {
		var req = {body : [] };
		var res = {
			send: function(status, message) {
				this.status = status;
				this.message = message;
			}	
		};

		api.processDataRequest(req, res);
		assert.equal("400" , res.status);
	});

	it('Ensure POST contains required element "src"', function() {
		var req = {body : [{}] };
		var res = {
			send: function(status, message) {
				this.status = status;
				this.message = message;
			}	
		};

		api.processDataRequest(req, res);
		assert.equal("400" , res.status);
	});
});
	