'use strict';

angular.module('pinzclientApp')
  .controller('QueryCtrl', function($scope, Metadataservice, dataService) {
    
    Metadataservice.getMetadata(function(dataSources) {
    	$scope.dataSources = dataSources;
    	if($scope.dataQuery === null || typeof $scope.dataQuery === "undefined") {
    		createDefaultQuery();
    	}

    });
    
    $scope.$watch(function() {
    	return $scope.dataQuery }
    	, function(newVal, oldVal) {
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

	    $scope.dataQuery = defaultQuery;
	    console.log("Data query set to:\n" + JSON.stringify($scope.dataQuery));
	}
});



