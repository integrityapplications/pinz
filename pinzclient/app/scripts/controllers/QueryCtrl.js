'use strict';

angular.module('modalApp')
  .controller('QueryCtrl', function($scope, Metadataservice, dataService) {
  	console.log("QueryCtrl (Modal) is active");
    
  	// a data object to store user input
	$scope.inputQuery = null;

	// a 'validated' object that is sent to the server.  Only contains properties that have been edited/set by user.
	$scope.dataQuery = {};

	$scope.serverQuery = {};


    Metadataservice.getMetadata(function(dataSources) {
    	$scope.dataSources = dataSources;
    	if($scope.inputQuery === null || typeof $scope.inputQuery === "undefined") {
    		createDefaultQuery();
    		createEmptyDataQuery();
    	}

    });

    $scope.dismiss = function() {
    	console.log("I'm trying to dismiss the modal!");
    	$("#myModal").modal("toggle");
    }
    
    $scope.$watch(function() {
    	return $scope.serverQuery }
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
	        	// add all values to default query if we have a fixed set of values - remove from data query if match
	        	var attribute = source.attrs[attrsIdx];
	            if(attribute.type == 'string' && ("values" in attribute) && (attribute.values.length > 0)) {
	            	sourceQuery.attrs.push({ k : attribute.name , v : attribute.values});
	            } else if(attribute.type == 'string'){
	                sourceQuery.attrs.push({ k : attribute.name , v : []});
	            } else if (attribute.type == 'number') {
                	sourceQuery.attrs.push({ k : attribute.name , low : null , high : null});
                }
            }
        	defaultQuery.push(sourceQuery);
        }
	    
		$scope.inputQuery = defaultQuery;

	}

	function createEmptyDataQuery() {
		var srcIdx;
		var tempDataQuery = [];
		for(srcIdx=0; srcIdx < $scope.dataSources.length; srcIdx++) {
			var tempAttrs = [];
			var attrIdx;
			for(attrIdx = 0 ; attrIdx < $scope.dataSources[srcIdx].attrs.length; attrIdx++) {
				tempAttrs.push({});
			}
			tempDataQuery.push( { src : $scope.dataSources[srcIdx]._id , attrs : tempAttrs } );
		}
		$scope.dataQuery = tempDataQuery;
	}

	
	$scope.saveUserQuery = function() {

		var tempDataQuery = [];
		var srcIdx;
		for(srcIdx = 0; srcIdx < $scope.inputQuery.length;srcIdx++) {
			
			var tempSrcQuery = {};

			var srcQuery = $scope.inputQuery[srcIdx];
		
			// gotta have a source name
			tempSrcQuery.src = srcQuery.src;

			// note server-side validation strips a empty array for time_within
			if(("time_within" in srcQuery) && (srcQuery.time_within != null)) {
				if(("start" in srcQuery.time_within) && ("end" in srcQuery.time_within)) {
					// we can have validation on the values in here, for now just leave
					tempSrcQuery.time_within = { start : srcQuery.time_within.start }
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

					if(("v" in attribute) == true) {

						// if an array with fixed values, assume set by pillbox
						if((attribute.v instanceof Array) == true && ("values" in $scope.dataSources[srcIdx].attrs[attrIdx])) {
							// if the dataQuery value isn't blank, add to tempQuery.  If it is blank, just ignore it
							if(($scope.dataQuery[srcIdx].attrs[attrIdx].v instanceof Array)
								&& ($scope.dataQuery[srcIdx].attrs[attrIdx].v.length > 0)
								&& ($scope.dataQuery[srcIdx].attrs[attrIdx].v.length != $scope.dataSources[srcIdx].attrs[attrIdx].values.length)
								) {
								// accumulate legit values
								tempAttrs.push({
									"k" : attribute.k,
									"v" : $scope.dataQuery[srcIdx].attrs[attrIdx].v
								});

								// append to skeleton dataQuery
								$scope.dataQuery[srcIdx].attrs[attrIdx] = { "k" :  attribute.k  , "v" : attribute.v };
							}

						// if we have just a string, add to array value list
						} else if(typeof attribute.v === 'string' && attribute.v.length > 0) {
							// accumulate legit values
							tempAttrs.push({
									"k" : attribute.k,
									"v" : attribute.v
							});

							// append to skeleton dataQuery
							$scope.dataQuery[srcIdx].attrs[attrIdx] = { "k" :  attribute.k  , "v" : attribute.v };

						
						}

					// guess we have a number...
					} else if( ("low" in attribute) && ("high" in attribute) ) {

							console.log("\tProcessing number attr: " + JSON.stringify(attribute));

							//  with high low, check range
							if(("low" in attribute) && (attribute.low != null) && ("high" in attribute) && (attribute.high != null)) {
								// ref values from metadata
								var attrRefLow = $scope.dataSources[srcIdx].attrs[attrIdx].low;
								var attrRefHigh = $scope.dataSources[srcIdx].attrs[attrIdx].high;
								console.log(attribute.low + " versus " + attrRefLow + " and " + attribute.high + " versus " + attrRefHigh);
								if( (attribute.low == attrRefLow && attribute.high == attrRefHigh) == false) {
									tempAttrs.push({
										"k" : attribute.k ,
										"low" : attribute.low ,
										"high" : attribute.high
									});

									// append
									$scope.dataQuery[srcIdx].attrs[attrIdx] = {
																				"k" : attribute.k ,
																				"low" : attribute.low ,
																				"high" : attribute.high
																			  };
								}
							
							} else {
									// if there arent any ref values, just add the min/max values
									tempAttrs.push({
											"k" : attribute.k ,
											"low" : attribute.low ,
											"high" : attribute.high
										});

									// append
									$scope.dataQuery[srcIdx].attrs[attrIdx] = {
																					"k" : attribute.k ,
																					"low" : attribute.low ,
																					"high" : attribute.high
																				};
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

		$scope.serverQuery = tempDataQuery;

		tempDataQuery = null;

		console.log("dataQuery = " + JSON.stringify($scope.dataQuery));
		console.log("serverQuery = " + JSON.stringify($scope.serverQuery));
	}



	$scope.updateDataQuery = function(srcIdx, attrIdx, valueIdx, clickedValue) {
		$scope.lastSelectVal = clickedValue;
		console.log("Button click for src" + srcIdx + ", attr" + attrIdx + ", value" + valueIdx);
		if(typeof $scope.dataQuery[srcIdx].attrs[attrIdx].v === 'undefined') {
			$scope.dataQuery[srcIdx].attrs[attrIdx].v = [];
		}
		var valueInQuery = false;
		var valIdx;
		for(valIdx = 0; valIdx < $scope.dataQuery[srcIdx].attrs[attrIdx].v.length; valIdx++) {
			if($scope.dataQuery[srcIdx].attrs[attrIdx].v[valIdx] === clickedValue) {
				valueInQuery = true;
				break;
			}
		}
		if(valueInQuery === false) {
			$scope.dataQuery[srcIdx].attrs[attrIdx].v.push(clickedValue);
		} else if(valueInQuery === true) {
			$scope.dataQuery[srcIdx].attrs[attrIdx].v.splice(valIdx , 1);
		}
	}


});



