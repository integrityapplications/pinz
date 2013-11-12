'use strict';

angular.module('pinzclientApp')
  .controller('MapCtrl', function ($scope, $timeout, dataService, Metadataservice) {
    $scope.mapversion = 0.1;
    //$scope.city = "Melbourne";

    function initLeaflet() {
	    var cLat = -37.81, cLon = 144.93;
	    var map = L.map('map',{  fullscreenControl: true }).setView([cLat, cLon], 11 ); 

	    //L.control.mousePosition().addTo(map);
	    var tileLayer = 
	    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	      maxZoom: 18,
	      minZoom: 2
	      //maxBounds: L.LatLngBounds( L.LatLng(-90,-180), L.LatLng(90,180) ) // sw, ne
	    });
	    map.addLayer( tileLayer );
	    //var baseLayers = {
	    //"CloudMade": tileLayer
	    //};
	
    }

    initLeaflet();

    $scope.cancelDataFeed = null;

    function updateData(query) {
    	console.log("start data feed");
    	console.log(dataService.getData(query));
    	$scope.cancelDataFeed = $timeout(function() {
	      updateData(query);
	      $scope.statusMessage = "polling for data...";
	    }, 2000);

    }

	$scope.startDataFeed = function() {
		buildQuery(function(query) {
			console.log('start the data feed with query ', query);
			updateData(query);
		});
	}

	$scope.stopDataFeed = function() {
		console.log('stop the data feed');
		$timeout.cancel($scope.cancelDataFeed);
		$scope.statusMessage = "stopped";
	}

    // get data from service

    function buildQuery(callback) {
    	// This is a stub for the real function that handles the returned JSON from the data-api
    	// At the mo, mock it up with something from metadata collection
    	var queryToSend = [];

    	Metadataservice.getMetadata(function (data) {
    		// result of hitting /metadata
    		// array of description JSON
    		data.forEach(function(item, index) {
    			var dataSourceOpts = {
    				"src": item._id,
    			}
    			queryToSend.push(dataSourceOpts);
    		});
    		console.log("query is ", queryToSend);
    		callback(queryToSend);
    	});
    }
    
  });
