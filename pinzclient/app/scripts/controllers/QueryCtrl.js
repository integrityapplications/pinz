'use strict';

angular.module('modalApp')
  .controller('QueryCtrl', function($scope, Metadataservice, QueryService, dataService) {
  	console.log("QueryCtrl (Modal) is active");
    
  	// a data object to store user input
	$scope.inputQuery = null;

	// transient object to help track indices for sources and attrs
	$scope.dataQuery = {};

	// a 'validated' object that is sent to the server.  Only contains properties that have been edited/set by user.
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
    		tempActiveSources.push("");
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
		// use query service to produce server validated query
		$scope.serverQuery = QueryService.validateQueryForServer($scope.inputQuery, $scope.inputQuery, $scope.dataSources, $scope.activeSources);

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


	$scope.updateActiveSources = function(sourceIdx) {

		if($scope.activeSources[sourceIdx] === '') {
			$scope.activeSources[sourceIdx] = 'disabled';

		} else if($scope.activeSources[sourceIdx].indexOf('disabled') !== -1) {
			$scope.activeSources[sourceIdx] = '';

		} else {
			console.log("\tCheck the state value::" + $scope.activeSources[sourceIdx] + " from " + $scope.activeSources);
		}

	}

});



