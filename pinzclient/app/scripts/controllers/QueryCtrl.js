'use strict';

angular.module('pinzclientApp')
  .controller('QueryCtrl', function($scope, Metadataservice, dataService) {
    
    console.log("Hello from QueryCtrl");
    //$scope.dataQuery = {};

    Metadataservice.getMetadata(function(dataSources) {
    	$scope.dataSources = dataSources;
    	
    	// will this bind to the dataService var?
    	//$scope.dataQuery = dataService.query;

    	$scope.dataQuery = createDefaultQuery($scope);
    	//dataService.setQuery($scope.dataQuery);

    });

    $scope.counter = 0;
    $scope.$watch(function() {
    	return $scope.dataQuery }
    	, function(newVal, oldVal) {
    	console.log('newval ', JSON.stringify(newVal), 'oldval ', JSON.stringify(oldVal));
    	dataService.setQuery(newVal);
  		
  		$scope.counter = $scope.counter + 1;
  		console.log('counter ', $scope.counter);
	},
	true);

	$scope.change = function(attr) {
		console.log("some attr ", attr);
		console.log("and data query is now ", $scope.dataQuery);
	}

	function createDefaultQuery(scope) {

		var defaultQuery = [];

		if(scope.dataQuery == null) {
	    	// now set up initial query object from metadata
	    	var sources = scope.dataSources;

		    console.log(sources.length + " data sources");
		    var idx;
		    for(idx=0 ; idx < sources.length; ++idx) {
		    	var source =  sources[idx];
		        var sourceQuery = {};
			    sourceQuery.src = source._id;
			    console.log("Source src = " + sourceQuery.src + " from " + source._id);

		        // blank geos - bind to polygon from geo tab
		        sourceQuery.geo_within = [];

		        // default time range - bind to UI range sliders
		        sourceQuery.time_within = {
		            start : new Date(),
		            end : new Date()
		        };

		        sourceQuery.attrs = [];
		        var attrsIdx;
		        for(attrsIdx=0; attrsIdx < source.attrs.length; ++attrsIdx) {
		        	var attribute = source.attrs[attrsIdx];
		            if(attribute.type == 'string') {
		                sourceQuery.attrs.push({ k : attribute.name , v : [""]});
		            } else if (attribute.type == 'number') {
		                if(attribute.min && attribute.max) {
		                    sourceQuery.attrs.push({ k : attribute.name , low : attribute.min , high : attribute.max});
		                } else {
		                    sourceQuery.attrs.push({ k : attribute.name , low : 0 , high : 100});
		                }
		            }
		        }
		        defaultQuery.push(sourceQuery);
		    }
		    console.log("Query over " + defaultQuery.length + " sources");
		    console.log(JSON.stringify(defaultQuery));
		    return defaultQuery;
		} else {
			return scope.dataQuery;
		}
	}
    
  });



