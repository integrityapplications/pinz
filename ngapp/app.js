// create module for custom directives
var leafletDemoApp = angular.module('leafletDemoApp', []);

leafletDemoApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

console.log('getting ready to start controller');
// controller business logic
leafletDemoApp.controller('AppCtrl', function AppCtrl ($scope, $http, $log) {
  //this should really go in services
  console.log('controller leafletDemoApp...');
  // initialize the model
  $scope.airport = 'DEN';
  $scope.appid = 'BG4knc7V34EO1r2zH9mNibF0xuc2GdaW68LsG3pPZ_yxOaY7UaQNTEej8453W2EN9M3BB0gIKeieRESm';

  $scope.initLeaflet = function() {
  	$log.log('init leaflet');
  	// set up initial marker
  	var lat = 40.001;
    var lon = -104.01;
    var map = new L.Map('map').setView([lat, lon], 9);
    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	  maxZoom: 18,
	  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	}).addTo(map);

    $scope.map = map;
  }

  $scope.locateAirport = function() {
  	$log.log('airport ', $scope.airport);
  	//$http.defaults.useXDomain = true;
    //delete $http.defaults.headers.common['X-Requested-With'];
    // http://where.yahooapis.com/v1/places.q(SFO)?format=geojson&appid=BG4knc7V34EO1r2zH9mNibF0xuc2GdaW68LsG3pPZ_yxOaY7UaQNTEej8453W2EN9M3BB0gIKeieRESm
    $http({
      method: 'GET',
      url:'http://where.yahooapis.com/v1/places.q(' +
        $scope.airport +
        ')?format=geojson' +
    	'&appid=' + 
    	$scope.appid
    }).
    success(function (data) {
      // attach this data to the scope
      $scope.data = data;
      $log.log('got data from yahoo', data);
      if (data.places.count > 0) {
      	var place = data.places.place[0];
      	var placeLon = place.coordinates[0];
      	var placeLat = place.coordinates[1];
      	var placeName = place.name;
      	$log.log('place ', placeName,' is at ', placeLat, ' ', placeLon);
      	//L.marker([placeLat,placeLon]).addTo(map).bindPopup("<b>" + placeName + "</b>").openPopup();
		L.marker([placeLat,placeLon]).addTo($scope.map).bindPopup("<b>" + placeName + "</b>");
		$scope.map.panTo([placeLat,placeLon]);
      }
      // clear the error messages
      $scope.error = '';
    }).
    error(function (data, status) {
      if (status === 404) {
        $scope.error = 'That place does not exist';
        $log.error('Could not find that place');
      } else {
        $scope.error = 'Error: ' + status;
        $log.error('Some other error...');
      }
    });
  }

  $scope.initLeaflet();

});
