var assert = require('assert');
var api = require('./../api');

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

	it('Valid POST', function() {
		var curosrMock = {
			limit: function(num) { return this;},
			toArray: function(callback) { callback(null, ["obsMock1", "obsMock2", "obsMock3"]);}
		};
		var collectionMock = {
			find: function(query) { return curosrMock;}
		};
		GLOBAL.dbHandle = { 
			collection: function(name) { return collectionMock;}
		};

		api.processDataRequest(validRequest, res);
		assert.equal("200", res.status);
		assert.equal(6, res.body.length);
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

	it('Null pinz observable gives null result' , function(){
		assert.equal( null,  api.convertPinzObsToRegularJson(null));
	});

	it('Invalid obs gives empty object result' , function(){
		result = api.convertPinzObsToRegularJson({ 'fred' : 'bloggs'});
		assert.deepEqual({} , result);
	});

	it('Legitimate pinz-obs gives valid observable JSON' , function(){
		testDate = new Date(2013,5,13);
		testPinzObs = {
	  		id : 'obsId1',
	  		src : 'obsSource1',
	  		t : testDate,
	  		attrs : [
		    	{
		   		   k : 'domainAttr_1' ,
		   		   v : 'someValue1'
		    	},
		    	{
		      		k : 'domainAttr_2',
		      		v : 1 ,
		      		u : 'MPH'
		    	}
		  	],
			geos : [
				{
	  				id : 'geolocationID_obs1',
	  				loc : {
	    					type : 'Point',
	    					coordinates : [-60, 30]
	  				}
				}
			]
	};
		testPrint = '{"id":"obsId1","src":"obsSource1","t":"2013-06-13T06:00:00.000Z","domainAttr_1":{"v":"someValue1"},"domainAttr_2":{"v":1,"u":"MPH"},"geos":[{"id":"geolocationID_obs1","loc":{"type":"Point","coordinates":[-60,30]}}]}';
		assert.equal(testPrint , JSON.stringify(api.convertPinzObsToRegularJson(testPinzObs)));

	});
});





describe( 'api.convertPinzObsArrayToRegularJson' , function() {


	it('Null input returns null' , function() {
		result = api.convertPinzObsArrayToRegularJson(null);
		assert.equal(null , result);
	});

	it('Empty obs array returns null' , function() {
		result = api.convertPinzObsArrayToRegularJson([]);
		assert.equal(null , result);
	});

	it('Valid pinzJson gives correctly formed obs array' , function() {
		// Seems months are zero-indexed in this constructor!
		var testDate = new Date(2013,5,13);
		var testData = [
			{
		  		id : 'obsId1',
		  		src : 'obsSource1',
		  		t : testDate,
		  		attrs : [
				    	{
				   		   k : 'domainAttr_1' ,
				   		   v : 'someValue1'
				    	},
				    	{
				      		k : 'domainAttr_2',
				      		v : 1 ,
				      		u : 'MPH'
				    	}
				  	],
		  			geos : [
		    				{
		      					id : 'geolocationID_obs1',
		      					loc : {
		        						type : 'Point',
		        						coordinates : [-60, 30]
		      						}
		    				}
		  			]
			} ,

			{
		  		id : 'obsId2',
		  		src : 'obsSource1',
		  		t : testDate,
		  		attrs : [
				    	{
				   		   k : 'domainAttr_1' ,
				   		   v : 'someOtherValue1'
				    	},
				    	{
				      		k : 'domainAttr_2',
				      		v : 3 ,
				      		u : 'MPH'
				    	}
				  	],
		  			geos : [
		    				{
		      					id : 'geolocationID_obs2',
		      					loc : {
		        						type : 'Point',
		        						coordinates : [-65, 35]
		      						}
		    				}
		  			]
			} ,

			{
		  		id : 'obsId3',
		  		src : 'obsSource1',
		  		t : testDate,
		  		attrs : [
				    	{
				   		   k : 'domainAttr_1' ,
				   		   v : 'yetAnotherValue1'
				    	},
				    	{
				      		k : 'domainAttr_3',
				      		v : 85 ,
				      		u : 'Kg'
				    	}
				  	],
		  			geos : [
		    				{
		      					id : 'geolocationID_obs3',
		      					loc : {
		        						type : 'Point',
		        						coordinates : [-63, 36]
		      						}
		    				}
		  			]
			}
		];


		var printResult = '[{"id":"obsId1","src":"obsSource1","t":"2013-06-13T06:00:00.000Z","domainAttr_1":{"v":"someValue1"},"domainAttr_2":{"v":1,"u":"MPH"},"geos":[{"id":"geolocationID_obs1","loc":{"type":"Point","coordinates":[-60,30]}}]},{"id":"obsId2","src":"obsSource1","t":"2013-06-13T06:00:00.000Z","domainAttr_1":{"v":"someOtherValue1"},"domainAttr_2":{"v":3,"u":"MPH"},"geos":[{"id":"geolocationID_obs2","loc":{"type":"Point","coordinates":[-65,35]}}]},{"id":"obsId3","src":"obsSource1","t":"2013-06-13T06:00:00.000Z","domainAttr_1":{"v":"yetAnotherValue1"},"domainAttr_3":{"v":85,"u":"Kg"},"geos":[{"id":"geolocationID_obs3","loc":{"type":"Point","coordinates":[-63,36]}}]}]';
		// modify data in place
		api.convertPinzObsArrayToRegularJson(testData);

		assert.deepEqual(printResult , JSON.stringify(testData));
	});

});
	