'use strict';

angular.module('modalApp')
  .controller('MapCtrl', function ($log, $scope, $timeout, dataService, Metadataservice) {
    $scope.mapversion = 0.1;
    $scope.startingCity = "Melbourne";

    $scope.cancelDataFeed = null;
    $scope.updateCount = 0;
    var lastRun = new Date();
    var currRun = new Date();

    function updateData(query, currentRunTime) {
    	console.log("start data feed");
        // hack that sets $rootScope.pinzData to latest data
    	dataService.getData(query);
    	$scope.cancelDataFeed = $timeout(function() {
            var now = new Date();
            query.forEach(function (source, index) {
                console.log('query src: ', source.src);
                console.log('start: ', source.time_within.start);
                source.time_inserted = {};
                source.time_inserted.start = currentRunTime;
            });
            currentRunTime = now;
	        updateData(query, currentRunTime);
            $scope.statusMessage = "polling for data...";
	    }, 2000);

    }

	$scope.startDataFeed = function() {
        if (dataService.dataQuery === null || typeof dataService.dataQuery === "undefined") {
            alert('Please enter a query first.');
        } else {
    		console.log('start the data feed with query ', dataService.dataQuery);

            var dq = dataService.dataQuery;
            var currentRunTime = new Date()
            dq.forEach(function(source, index) {
                console.log('source.src: ', source.src);
                console.log(' start: ', source.time_within.start, ' end ', source.time_within.end);
                //currentRunTime = source.time_within.end;
            })
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
