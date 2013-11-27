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
    	return $scope.dataQuery }
    	, function(newVal, oldVal) {
    		dataService.setQuery(newVal);
		}, 
		true);
    
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

		$scope.testArray = [ "Bill" , "Fred" , "John" , "Eric" , "Bobby" , "Chuck"];
	}

	function createEmptyDataQuery() {
		var srcIdx;
		var tempDataQuery = [];
		for(srcIdx=0; srcIdx < $scope.dataSources.length; srcIdx++) {
			var sourceQuery = {};
			tempDataQuery.push( { src : $scope.dataSources[srcIdx]._id} );
		}
		$scope.dataQuery = tempDataQuery;
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
					tempSrcQuery.time_within = { start : srcQuery.time_within.start}
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
				if(attribute != null) {
					if(("v" in attribute) && (attribute.v != null)) {

						// if the attribute is an array, ensure it is not empty
						if(attribute.v instanceof Array && attribute.v.length > 0) {
							tempAttrs.push(attribute);
						} else if(typeof attribute.v == 'string') {
							tempAttrs.push(attribute);
						}
					} else if(("low" in attribute) && (attribute.low != null) && ("high" in attribute) && (attribute.high != null)) {
						// ref values from metadata
						var attrRefLow = $scope.dataSources[srcIdx].attrs[attrIdx].low;
						var attrRefHigh = $scope.dataSources[srcIdx].attrs[attrIdx].high;
						if(attribute.low != attrRefLow || attribute.high != attrRefHigh) {
							tempAttrs.push(attribute);
						}
					}
				}
			}
			// only add attrs if we actually have some values
			if(tempAttrs.length > 0) {
				tempSrcQuery.attrs = tempAttrs;
			}

			tempDataQuery.push(tempSrcQuery);
		}

		$scope.dataQuery = tempDataQuery;
		tempDataQuery = null;
	}

});



