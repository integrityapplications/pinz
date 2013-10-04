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

	it('Valid POST', function() {
		var curosrMock = {
			toArray: function(callback) { callback(null, ["obsMock1", "obsMock2", "obsMock3"]);}
		};
		var collectionMock = {
			find: function(query) { return curosrMock;}
		};
		GLOBAL.dbHandle = { 
			collection: function(name) { return collectionMock;}
		};

		var req = {body : [{src: "source1"}] };
		var res = {
			send: function(status, body) {
				this.status = status;
				this.body = body;
			}	
		};

		api.processDataRequest(req, res);
		assert.equal("200", res.status);
		assert.equal(3, res.body.length);
	});
});
	