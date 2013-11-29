'use strict';

angular.module('modalApp')
  .controller('MapCtrl', function ($log, $scope, $timeout, dataService, Metadataservice) {
    $scope.mapversion = 0.1;
    $scope.startingCity = "Melbourne";

    $scope.cancelDataFeed = null;
    $scope.updateCount = 0;

    var refreshInMs = 5000;
    var lastRun = new Date();
    var currRun = new Date();

    function updateData(query, currentRunTime) {
    	console.log("start data feed");
        // hack that sets $rootScope.pinzData to latest data
    	dataService.getData(query);
    	$scope.cancelDataFeed = $timeout(function() {
            var now = new Date();
            query.forEach(function (source, index) {
                //console.log('query src: ', source.src);
                //console.log('time_within: ', source.time_within);
                source.time_inserted = {};
                source.time_inserted.start = currentRunTime;
            });
            currentRunTime = now;
	        updateData(query, currentRunTime);
            $scope.statusMessage = "polling for data...";
	    }, refreshInMs);

    }

	$scope.startDataFeed = function() {
        if (dataService.dataQuery === null || typeof dataService.dataQuery === "undefined") {
            alert('Please enter a query first.');
        } else {
            var dq = dataService.dataQuery;
            var currentRunTime = new Date()
            $scope.realDataQuery = dataService.dataQuery; // Need serious thought!
            updateData($scope.realDataQuery, currentRunTime);
        }
	}

	$scope.stopDataFeed = function() {
		console.log('stop the data feed');
		$timeout.cancel($scope.cancelDataFeed);
		$scope.statusMessage = "stopped";
	}   
    
  });
