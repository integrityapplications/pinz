'use strict';

angular.module('pinzclientApp')
  .controller('QueryCtrl', function($scope, Metadataservice) {
    
    console.log("Hello from QueryCtrl");

    Metadataservice.getMetadata(function(dataSources) {
    	$scope.dataSources = dataSources;
    	$scope.dataQuery = createDefaultQuery($scope.dataSources);

    }); 
    
  });

function createDefaultQuery(sources) {

	var defaultQuery = [];

    	// now set up initial query object from metadata
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

}