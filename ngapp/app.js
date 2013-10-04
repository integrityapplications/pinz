// create module for custom directives
var leafletDemoApp = angular.module('leafletDemoApp', []);

leafletDemoApp.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}
]);

// controller business logic
leafletDemoApp.controller('AppCtrl', function AppCtrl ($scope, $http, $log, $timeout) {
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
    $scope.layerType="heat";
    // This is the marker data currently displayed.
    $scope.markers = new L.LayerGroup();
    $scope.map.addLayer($scope.markers);
    // This array holds our point data.  Watch it and display when dirty.
    $scope.geoData = null;
    $scope.$watch( 'geoData', function(newVal, oldVal){
      $log.log( 'geoData changed, invoking display' );
      displayData( newVal );
    });
  }

  $scope.postData = [
	{
		"src" : "A",
		"time_within" : {
			"start" : "2013-09-13T16:00:00",
			"end" : "2099-12-31T23:59:59"
		},
		"geo_withinDISABLED" : [
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

  $scope.cancelDataFeed = null;

  function updateData() {
    $scope.getPinzData();
    $scope.cancelDataFeed = $timeout(function() {
        updateData();
    }, $scope.pollingTimeout * 1000);
  } 

  $scope.startDataFeed = function() {
    console.log('start the data feed');
    updateData();
  }

  $scope.stopDataFeed = function() {
    console.log('stop the data feed');
    $timeout.cancel($scope.cancelDataFeed);
  }

  $scope.getPinzData = function() {
    $log.log('getPinzData: invoked');
    // set the time and geo params for the data query from the totally awesome data service.
    var timewithin = 
    {
	"start" : moment().subtract('minutes',1).toISOString(),
	"end"   : moment().toISOString() // now
    };
    $log.log( 'setting timewithin = ', timewithin );
    $scope.postData[0].time_within = timewithin;
    $log.log( 'after setting, postdata = ', $scope.postData[0] );

    $http({
      method: 'POST',
      url:'/data',
      data:$scope.postData,
      headers:headersCfg
    }).success(function (data) {
      // attach this data to the scope.  It is an array of leaflet lat-long objects.
      $scope.geoData = reformatData(data);
      $log.log('Retrieved geoData has length ', $scope.geoData.length);
      // now it's watched, see above
      //displayData( $scope.geoData );
      // clear the error messages
      $scope.error = 'success';
    }).error(function (data, status) {
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
    //console.debug(data);
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
    if ( lfltPoints == null ) return;

    // Remove previous
    $scope.markers.clearLayers();

    $log.log( 'displaying ' + lfltPoints.length + ' data points with render option ', $scope.layerType );
    switch ($scope.layerType) {
      case 'points':
	for ( var i=0; i<Math.min(1000000000,lfltPoints.length); i ++ ){
	  $scope.markers.addLayer(new L.Marker( lfltPoints[i] ) );
        }
        //$log.log( 'markers layer id = ', $scope.markers.getLayers()[0]._leaflet_id );
	//console.debug( 'markers = ', $scope.markers );
	//$scope.map.addLayer($scope.markers);
	$scope.map.fitWorld();
	break
      case 'cluster':
	var mcg = new L.MarkerClusterGroup();
	for ( var i=0; i<lfltPoints.length; i ++ ){
	  mcg.addLayer(new L.Marker( lfltPoints[i] ) );
        }
	$scope.markers.addLayer(mcg);
	//$scope.map.addLayer($scope.markers);
	$scope.map.fitWorld();
	break;
      case 'heat':
	var heatmapLayer = L.TileLayer.heatMap({
	  radius: 20,
	  opacity: 50,
	  gradient: {
	    0.45: "rgb(0,0,255)",
	    0.55: "rgb(0,255,255)",
	    0.65: "rgb(0,255,0)",
	    0.95: "yellow",
	    1.0: "rgb(255,0,0)"
	  }
        });
	newPts = [];
	//console.log(lfltPoints);
	var lls = 1000;
	var lln = -1000;
	var llw = 1000;
	var lle = -1000;

	for ( var i=0; i<Math.min(1000000000,lfltPoints.length); i ++ ){
	  var pt = lfltPoints[i];
	  newPts.push( {lat: pt.lat, lon: pt.lng, value: 1} );
	  lls = Math.min( lls, pt.lat );
	  lln = Math.max( lln, pt.lat );
	  llw = Math.min( llw, pt.lng );
	  lle = Math.max( lle, pt.lng );
        }
	heatmapLayer.addData(newPts);
	// Add this layer inside a layer group
	//$scope.markers = new L.LayerGroup();
	$scope.markers.addLayer( heatmapLayer );
	//$scope.map.addLayer($scope.markers);
	var llbounds = [[lls,llw],[lln,lle]];
	console.log('lat long bounds = ', llbounds);
	$scope.map.fitBounds( llbounds );
	//$scope.map.fitWorld();
	break;
      default:
	$log.log( 'Undefined display type ' + $scope.layerType );
	break;
    }
  }

  $scope.initLeaflet();

});
