'use strict';

angular.module('modalApp')
  .controller('QueryCtrl', function($scope, Metadataservice, dataService) {
  	console.log("QueryCtrl (Modal) is active");
    
  	// a data object to store user input
	$scope.userQuery = null;

	// a 'validated' object that is sent to the server.  Only contains properties that have been edited/set by user.
	$scope.dataQuery = {};


    Metadataservice.getMetadata(function(dataSources) {
    	$scope.dataSources = dataSources;
    	if($scope.userQuery === null || typeof $scope.userQuery === "undefined") {
    		createDefaultQuery();
    		createEmptyDataQuery();
    	}

    });
    
    $scope.$watch(function() {
    	return $scope.userQuery }
    	, function(newVal, oldVal) {
    		console.log('new query value: ', newVal);
    	dataService.setQuery(newVal);
	}, true);
    
	function createDefaultQuery() {
		var defaultQuery = [];
    	var sources = $scope.dataSources;
	    var idx;
	    var dayInMs = 24 * 60 * 60 * 1000;
	    var daysBackInMs = 7 * dayInMs;

	    for(idx=0 ; idx < sources.length; ++idx) {
	    	var source =  sources[idx];
	        var sourceQuery = {};
		    sourceQuery.src = source._id;

	        sourceQuery.geo_within = [];

	        sourceQuery.time_within = {
	            start : new Date(new Date().getTime() - daysBackInMs),
	            end : new Date()
	        };
	        
	        sourceQuery.attrs = [];
	        var attrsIdx;
	        for(attrsIdx=0; attrsIdx < source.attrs.length; ++attrsIdx) {
	        	var attribute = source.attrs[attrsIdx];
	            if(attribute.type == 'string') {
	                sourceQuery.attrs.push({ k : attribute.name , v : []});
	            } else if (attribute.type == 'number') {
                	sourceQuery.attrs.push({ k : attribute.name , low : null , high : null});
                    // sourceQuery.attrs.push({ k : attribute.name , low : 0 , high : 100});
                }
            }
        	defaultQuery.push(sourceQuery);
        }
	    
		$scope.userQuery = defaultQuery;
		console.log("User query set to:\n" + JSON.stringify($scope.userQuery));
	}

	function createEmptyDataQuery() {
		var srcIdx;
		var tempDataQuery = [];
		for(srcIdx=0; srcIdx < $scope.dataSources.length; srcIdx++) {
			var sourceQuery = {};
			tempDataQuery.push( { src : $scope.dataSources[srcIdx]._id} );
		}
		$scope.dataQuery = tempDataQuery;
		console.log("Starter dataQuery set to:\n" + JSON.stringify($scope.userQuery));
	}

	// run grunt tests for QueryCtrl
	$scope.saveUserQuery = function() {
		var tempDataQuery = [];
		var srcIdx;
		for(srcIdx = 0; srcIdx < $scope.userQuery.length;srcIdx++) {
			
			var tempSrcQuery = {};

			var srcQuery = $scope.userQuery[srcIdx];
		
			// gotta have a source name
			tempSrcQuery.src = srcQuery.src;

			// note server-side validation strips a empty array for time_within
			if(("time_within" in srcQuery) && (srcQuery.time_within != null)) {
				if(("start" in srcQuery.time_within) && ("end" in srcQuery.time_within)) {
					// we can have validation on the values in here, for now just leave
					tempSrcQuery.time_within = srcQuery.time_within;
				}
			}

			// note server-side validation strips empty time_within array
			if(("geo_within" in srcQuery) && (srcQuery.geo_within != null) && (srcQuery.geo_within.length > 0)) {
				tempSrcQuery.geo_within = srcQuery.geo_within;	
			}

			// now deal with attributes
			var attrIdx;
			var tempAttrs = [];

			for(attrIdx = 0; attrIdx < srcQuery.attrs.length; attrIdx++) {
				
				var attribute = srcQuery.attrs[attrIdx];
				console.log("\t\tAttribute " + attrIdx + " = " + JSON.stringify(attribute));
				if(attribute != null) {
					if(("v" in attribute) && (attribute.v != null)) {

						// if the attribute is an array, ensure it is not empty
						if(attribute.v instanceof Array && attribute.v.length > 0) {
							console.log("\t\tAdding attribute value array " + JSON.stringify(attribute.v));
							tempAttrs.push(attribute);
						} else if(typeof attribute.v == 'string') {
							console.log("\t\tAdding string attribute " + attrIdx + " = " + JSON.stringify(attribute));
							tempAttrs.push(attribute);
						}
					} else if(("low" in attribute) && (attribute.low != null) && ("high" in attribute) && (attribute.high != null)) {
						// ref values from metadata
						var attrRefLow = $scope.dataSources[srcIdx].attrs[attrIdx].low;
						var attrRefHigh = $scope.dataSources[srcIdx].attrs[attrIdx].high;
						console.log("\t\tComparing attr low/high to ref metadata values: refLow=" + attrRefLow + " , refHigh=" + attrRefHigh);
						if(attribute.low != attrRefLow && attribute.high != attrRefHigh) {
							console.log("\t\tAdding number range attribute " + attrIdx + " = " + JSON.stringify(attribute));
							tempAttrs.push(attribute);
						}
					}
				}
			}
			// only add attrs if we actually have some values
			if(tempAttrs.length > 0) {
				tempSrcQuery.attrs = tempAttrs;
			}

			console.log("\tAdding " + JSON.stringify(tempSrcQuery) + " to tempDataQuery");
			tempDataQuery.push(tempSrcQuery);
		}

		console.log("Setting the $scope.dataQuery to be the cleaned up tempDataQuery..." + JSON.stringify(tempDataQuery));
		$scope.dataQuery = tempDataQuery;
		tempDataQuery = null;
		console.log("Query that is sent to the server::\n" + JSON.stringify($scope.dataQuery));
	}

});



