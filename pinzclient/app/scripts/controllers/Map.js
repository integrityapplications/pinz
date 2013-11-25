'use strict';

angular.module('pinzclientApp')
  .controller('MapCtrl', function ($log, $scope, $timeout, dataService, Metadataservice) {
    $scope.mapversion = 0.1;
    $scope.startingCity = "Melbourne";

    $scope.cancelDataFeed = null;
    $scope.updateCount = 0;

    function updateData(query) {
    	console.log("start data feed");
        // hack that sets $rootScope.pinzData to latest data
    	dataService.getData(query); 
    	$scope.cancelDataFeed = $timeout(function() {
	      updateData(query);
	      $scope.statusMessage = "polling for data...";
	    }, 2000);

    }

	$scope.startDataFeed = function() {
		console.log('start the data feed with query ', dataService.dataQuery);
        $scope.realDataQuery = dataService.dataQuery; // Need serious thought!
        updateData($scope.realDataQuery);
	}

	$scope.stopDataFeed = function() {
		console.log('stop the data feed');
		$timeout.cancel($scope.cancelDataFeed);
		$scope.statusMessage = "stopped";
	}   
    
  });
