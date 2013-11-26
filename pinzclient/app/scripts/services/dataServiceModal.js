'use strict';

console.log("I'm alive!");

angular.module('modalApp')
.service('dataService', function dataService($http, $log, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var query = {};
    var ds = {};

    ds.getData = function(query) {
		$log.log('Retrieving data with this ', JSON.stringify(query));

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
	        $rootScope.statusMessage = 'success';
	        $rootScope.pinzData = data;
	        
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
		console.log("data service query is ", JSON.stringify(query));
		ds.dataQuery = query;
	}

    return ds;
    
});

	