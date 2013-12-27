'use strict';

angular.module('modalApp')
  .controller('QueryCtrl', function($scope, Metadataservice, dataService) {
  	console.log("QueryCtrl (Modal) is active");
    
  	// a data object to store user input
	$scope.inputQuery = null;

	// a 'validated' object that is sent to the server.  Only contains properties that have been edited/set by user.
	$scope.dataQuery = {};

	$scope.serverQuery = {};

	$scope.activeSources = [];

    Metadataservice.getMetadata(function(dataSources) {
    	$scope.dataSources = dataSources;
    	if($scope.inputQuery === null || typeof $scope.inputQuery === "undefined") {
    		createDefaultQuery();
    		createEmptyDataQuery();
    		setDefaultActiveSources();
    	}

    });

    $scope.dismiss = function() {
    	$("#myModal").modal("toggle");
    }
    
    $scope.$watch(function() {
    	return $scope.serverQuery }
    	, function(newVal, oldVal) {
    		dataService.setQuery(newVal);
		}, 
		true);
    
    function setDefaultActiveSources() {
    	var srcIdx;
    	var tempActiveSources = [];
    	for(srcIdx = 0; srcIdx < $scope.dataSources.length ; srcIdx++) {
    		// default to false values
    		tempActiveSources.push("active");
    	}
    	$scope.activeSources = tempActiveSources;
    }

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

			// If geo input exists, set it on each src - hence 'global' name of geo param
			if(("globalGeo" in $scope.inputQuery) && ($scope.inputQuery.globalGeo != null)) {
				tempSrcQuery.geo_within = $scope.inputQuery.globalGeo;	
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

					// no v, but we might have a number...
					} else if( ("low" in attribute) && ("high" in attribute) ) {

						if(attribute.low != null && attribute.high != null) {
							
							console.log("\tProcessing non-null number attr: " + JSON.stringify(attribute));

							var attrRefLow = $scope.dataSources[srcIdx].attrs[attrIdx].low;
							var attrRefHigh = $scope.dataSources[srcIdx].attrs[attrIdx].high;

							if ((attrRefLow == null || typeof attrRefLow == 'undefined') && (attrRefHigh == null || typeof attrRefHigh == 'undefined')) {

								tempAttrs.push({
										"k" : attribute.k ,
										"low" : attribute.low ,
										"high" : attribute.high
								});

								// update dataQuery
								$scope.dataQuery[srcIdx].attrs[attrIdx] = {
											"k" : attribute.k ,
											"low" : attribute.low ,
											"high" : attribute.high
										};

							} else {

								if( (attribute.low == attrRefLow && attribute.high == attrRefHigh) == false) {
									// include in serverQuery temp object
									tempAttrs.push({
										"k" : attribute.k ,
										"low" : attribute.low ,
										"high" : attribute.high
									});

									// update dataQuery
									$scope.dataQuery[srcIdx].attrs[attrIdx] = 
										{
											"k" : attribute.k ,
											"low" : attribute.low ,
											"high" : attribute.high
										};
								}

							}
						}
					}

				}

				// only add attrs if we actually have some values
				if(tempAttrs.length > 0) {
					tempSrcQuery.attrs = tempAttrs;
				}

			}

			tempDataQuery.push(tempSrcQuery);
		}

		$scope.serverQuery = tempDataQuery;
		tempDataQuery = null;

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


	$scope.updateActiveSources = function(sourceIdx , sourceID) {
		var tab = $("tab" + sourceIdx);

		console.log("Button clicked for source " + sourceIdx + " for tab with classes " + tab.attr('class'));

		if($scope.activeSources[sourceIdx] == 'active') {
			console.log("\tStart state = " + $scope.activeSources[sourceIdx]);
			$scope.activeSources[sourceIdx] = 'disabled';
			console.log("\tNew state = " + $scope.activeSources[sourceIdx]);
			tab.addClass('disabled');

			console.log("\tNew tab class = " + tab.attr('class'));

		} else if($scope.activeSources[sourceIdx] == 'disabled') {
			console.log("\tStart state = " + $scope.activeSources[sourceIdx]);
			$scope.activeSources[sourceIdx] = 'active';
			console.log("\tNew state: " + $scope.activeSources[sourceIdx]);

			tab.removeClass('disabled');
			$scope.apply();
			
			console.log("\tNew tab class = " + tab.attr('class'));

		} else {
			console.log("\tCheck the state value::" + $scope.activeSources[sourceIdx] + " from " + $scope.activeSources);
		}

	}

});



