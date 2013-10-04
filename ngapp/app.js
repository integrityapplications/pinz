// create module for custom directives
var leafletDemoApp = angular.module('leafletDemoApp', []);

leafletDemoApp.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}
]);

// controller business logic
leafletDemoApp.controller('AppCtrl', function AppCtrl ($scope, $http, $log) {
  //this should really go in services

  $scope.initLeaflet = function() {
    // set up initial marker
    var cLat = -37.81, cLon = 144.93;
    var map = L.map('map',{  fullscreenControl: true }).setView([cLat, cLon], 11 ); 

    L.control.mousePosition().addTo(map);
    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 18,
      minZoom: 2
      //maxBounds: L.LatLngBounds( L.LatLng(-90,-180), L.LatLng(90,180) ) // sw, ne
    }).addTo(map);

    $scope.map = map;
    $scope.layerType="points";
  }

  $scope.postData = [
    {
      "src" : "A",
      "time-within" : {
	"start" : "2013-09-13T16:00:00",
	"end" : "2013-09-13T16:00:30"
      },
      "geo-within" : [
	40.0, -55.0,
	40.0, -30.0,
	10.0, -30.0,
	10.0, -55.0,
	40.0, -55.0
      ],
      "attrs" : [
	{
	  "k" : "color",
	  "v" : ["red" , "green"]
	},
	{
	  "k" : "animal",
	  "v" : ["koala"]
	},
	{
	  "k" : "weight",
	  "low" : 50,
	  "high" : 100
	}
      ]
    }
  ];

  var headersCfg = {"content-type":"application/json"};

  $scope.getPinzData = function() {
    $log.log('getPinzData: invoked');
    $http({
      method: 'POST',
      url:'/data',
      data:$scope.postData,
      headers:headersCfg
    }).
	  success(function (data) {
      // attach this data to the scope.  It is an array of leaflet lat-long objects.
      $scope.geoData = reformatData(data);
      displayData( $scope.geoData );
      // clear the error messages
      $scope.error = 'success';
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

  function reformatData(data) {
    console.debug(data);
    var observables = data; // an array of them
    var formatted = [];
    for ( var i=0; i<observables.length; i++ ) {
      var obs = observables[i];
      if ( obs.geos.length>0 ) {
	// loop over the array of geos
	for ( var j=0; j<obs.geos.length; j++ ) {
	  var geo = obs.geos[j];
	  var lfltLL = L.latLng( geo.loc.coordinates[1], geo.loc.coordinates[0] );
	  formatted.push(lfltLL);
	}
      }// if
    }// for i
    return formatted;
  }

  function displayData( lfltPoints ) {
    $log.log( 'displaying data with render option ', $scope.render );
    var markers = new L.MarkerClusterGroup();
    for ( var i=0; i<lfltPoints.length; i ++ ){
      markers.addLayer(new L.Marker( lfltPoints[i] ) );
    }
    $scope.map.addLayer(markers);
    $scope.map.fitBounds(markers.getBounds());
    //$scope.map.setMaxBounds( L.LatLngBounds( L.LatLng(-90,-180), L.LatLng(90,180) ) );
  }

  $scope.initLeaflet();

});
