'use strict';

console.log("I'm alive!");

angular.module('modalApp')
.service('dataService', function dataService($http, $log, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var query = {};
    var ds = {};


    // util function
    var clearQuery = function(queryIn) {

		var cleanQuery = [];

		if(queryIn != null && typeof query != 'undefined') {

    		if((queryIn instanceof Array) == true) {

    			if(queryIn.length == 0) {

    				var numSrcQueries = queryIn.length;
    				var srcIdx;

    				for(srcIdx = 0 ; srcIdx < numSrcQueries ; srcIdx++) {
    					var tempSrcQuery = {};

    					var srcQuery = queryIn[srcIdx];
    					srcQuery.src = queryIn[srcIdx].src;
    					if("geo_within" in srcQuery) {
    						if(srcQuery.geo_within instanceof Array) {
    							if(srcQuery.geo_within.length > 0) {
    								tempSrcQuery.geo_within = srcQuery.geo_within;
    							}
    						}
    					}

    					if("time_within" in srcQuery) {
    						if(("start" in srcQuery.time_within) && ("end" in srcQuery.time_within)  ) {
    							tempSrcQuery.time_within = srcQuery.time_within;
    						}
    					}

    					if("attrs" in srcQuery) {
    						if(srcQuery.attrs instanceof Array) {
    							if(srcQuery.attrs.length > 0) {
    								var tempAttrs = [];
    								var attrIdx;

    								for(attrIdx = 0; attrIdx < srcQuery.attrs.length; attrIdx++) {
    									var attibute = srcQuery.attrs[attrIdx];
    									if("k" in attribute && ("v" in attribute || "high" in attribute || "low" in attribute )) {
    										tempAttrs.push(attribute);
    									}
    								}
    								tempSrcQuery.attrs = tempAttrs;
    							}
    						}

    					}
    					cleanQuery.push(tempSrcQuery);
    					console.log("Updated cleanQuery: " + JSON.stringify(cleanQuery));
    				}

    			} else {
    				console.log("WARNING: Input query array has 0 entries!");
    			}
    		}
    	}
    	console.log("The *actual* query sent to the server is...\n" + JSON.stringify(cleanQuery));

	}






    ds.getData = function(query) {
		//$log.log('Retrieving data with this ', JSON.stringify(query));

		var headersCfg = {"content-type":"application/json"};
	    // Now post'em
	    $http({
	    	method: 'POST',
	    	url:'/data',
	    	data:query,
	    	headers:headersCfg
	    }).success(function (data) {
	    	$log.log("data received, updating scope");

	        // clear the error messages
	        $rootScope.statusMessage = 'success (' + data.length + ' pinz received)!';
	        $rootScope.pinzData = data;
	        //console.debug("Data received: ", data);
	        
	    }).error(function (data, status) {
	    	if (status === 404) {
	    		$rootScope.error = 'That place does not exist';
	    		$log.error('Could not find that place');
	    	} else {
	    		$rootScope.error = 'Error: ' + status;
	    		$log.error('Some other error...');
	    	}
	    });

	}

	ds.setQuery = function(query) {
		// place a final check fo null, empy or blank query values
		// ds.dataQuery = cleanDataQuery(query);
	    
		ds.dataQuery = query;

	}

    return ds;
    
});

	