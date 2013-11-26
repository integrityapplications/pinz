var assert = require('assert');
var api = require('./../api');

var nativeDoc = {
	id : 'id1',
	src : 'source1',
	t : new Date(2013,5,13),
	attrs : [
		{
			k : 'domainAttr1' ,
			v : 'someValue1'
		},
		{
			k : 'domainAttr2',
			v : 1 ,
			u : 'MPH'
		}
	],
	geos : []
};

function deepCopy(original) {
	var deepCopy = JSON.parse(JSON.stringify(original));
	return deepCopy;
}

describe( 'api.processDataRequest', function() {

	var res = {
		send: function(status, body) {
			this.status = status;
			this.body = body;
		}	
	};

	var validRequest = {
		body : [
			{src: "source1"},
			{src: "source2"}
		],
		headers : {
			"pinz-debug-query": false
		}
	};

	it('Ensure POST is JSON array', function() {
		var req = {body : {} };
		api.processDataRequest(req, res);
		assert.equal("400" , res.status);
	});

	it('Ensure POST JSON array is not empty', function() {
		var req = {body : [] };
		api.processDataRequest(req, res);
		assert.equal("400" , res.status);
	});

	it('Ensure POST contains required element "src"', function() {
		var req = {body : [{}] };
		api.processDataRequest(req, res);
		assert.equal("400" , res.status);
	});

	it('Mongo exception', function() {
		var curosrMock = {
			limit: function(num) { return this;},
			toArray: function(callback) { callback("simulated mongo exception", null);}
		};
		var collectionMock = {
			find: function(query) { return curosrMock;}
		};
		GLOBAL.dbHandle = { 
			collection: function(name) { return collectionMock;}
		};

		api.processDataRequest(validRequest, res);
		assert.equal("500", res.status);
	});

	it('invalid post, unable to build query', function() {
		var invalidRequest = {
			body : [
				{
					"src": "source1",
					"time_within": {"start": "notValidFormat", "end" : "2013-09-13T16:00:30"}
				}
			]
		};
		api.processDataRequest(invalidRequest, res);
		assert.equal(res.status, "400");
		assert.equal(res.body, "Bad Request, Invalid date format, expecting: 'yyyy-mm-ddTHH:MM:SS', you provided: notValidFormat");
	});

	it('Valid POST, Accept pinz-json', function() {
		var curosrMock = {
			limit: function(num) { return this;},
			toArray: function(callback) { callback(null, [nativeDoc, nativeDoc, nativeDoc]);}
		};
		var collectionMock = {
			find: function(query) { return curosrMock;}
		};
		GLOBAL.dbHandle = { 
			collection: function(name) { return collectionMock;}
		};

		validRequest.headers.Accept = 'pinz-json';
		api.processDataRequest(validRequest, res);
		assert.equal("200", res.status);
		assert.equal(6, res.body.length);
		assert.equal("domainAttr1", res.body[0].attrs[0].k);
		assert.equal("someValue1", res.body[0].attrs[0].v);
	});

	it('Valid POST, Accept application-json', function() {
		var curosrMock = {
			limit: function(num) { return this;},
			toArray: function(callback) { callback(null, [deepCopy(nativeDoc), deepCopy(nativeDoc)]);}
		};
		var collectionMock = {
			find: function(query) { return curosrMock;}
		};
		GLOBAL.dbHandle = { 
			collection: function(name) { return collectionMock;}
		};

		validRequest.headers.Accept = 'application/json';
		api.processDataRequest(validRequest, res);
		assert.equal("200", res.status);
		assert.equal(4, res.body.length);
		//ensure native documents converted to client friendly documents
		assert.equal("someValue1", res.body[0].attrs.domainAttr1.v);
	});
});

describe( 'api.processMetadataRequest', function() {

	var res = {
		send: function(status, body) {
			this.status = status;
			this.body = body;
		},
		json: function(body) {
			this.status = 200;
			this.body = body;
		}	
	};

	it('Get', function() {
		var curosrMock = {
			limit: function(num) { return this;},
			toArray: function(callback) { callback(null, ["descMock1", "descMock1", "descMock1"]);}
		};
		var collectionMock = {
			find: function(query) { return curosrMock;}
		};
		GLOBAL.dbHandle = { 
			collection: function(name) { return collectionMock;}
		};

		api.processMetadataRequest({}, res);
		assert.equal("200", res.status);
		assert.equal(3, res.body.length);
	});
});


describe( 'api.convertPinzObsToRegularJson' , function() {
	it('Legitimate pinz-obs gives valid observable JSON' , function(){
		var transformedDoc = api.convertPinzObsToRegularJson(deepCopy(nativeDoc));
		assert.equal(1, transformedDoc.attrs.domainAttr2.v);
		assert.equal('MPH', transformedDoc.attrs.domainAttr2.u);
	});
});