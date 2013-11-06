'use strict';

angular.module('pinzclientApp')
.service('dataService', function dataService($http, $log, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var ds = {};
    ds.getData = function(query) {
		$log.log('Retrieving data with this ', query);

		var headersCfg = {"content-type":"application/json"};
	    // Now post'em
	    $http({
	    	method: 'POST',
	    	url:'/data',
	    	data:query,
	    	headers:headersCfg
	    }).success(function (data) {
	    	$log.log("data received ", data);

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
    return ds;
});

	