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

  // $scope.getGeoPlanetData = function () {
  // 	$log.log('get data from yahoo');
  // 	$httpProvider.defaults.useXDomain = true;
  //   delete $httpProvider.defaults.headers.common['X-Requested-With'];
  //   // http://where.yahooapis.com/v1/places.q(SFO)?format=geojson&appid=BG4knc7V34EO1r2zH9mNibF0xuc2GdaW68LsG3pPZ_yxOaY7UaQNTEej8453W2EN9M3BB0gIKeieRESm
  //   $http({
  //     method: 'GET',
  //     url:'http://where.yahooapis.com/v1/places.q(' +
  //       $scope.airport +
  //       ')?format=geojson' +
  //   	'&appid=' + 
  //   	$scope.appid
  //   }).
  //   success(function (data) {
  //     // attach this data to the scope
  //     $scope.data = data;
  //     $log.log('got data from yahoo');

  //     // clear the error messages
  //     $scope.error = '';
  //   }).
  //   error(function (data, status) {
  //     if (status === 404) {
  //       $scope.error = 'That place does not exist';
  //       $log.error('Could not find that place');
  //     } else {
  //       $scope.error = 'Error: ' + status;
  //       $log.error('Some other error...');
  //     }
  //   });
  // };

  // console.log('do something!')

  // $scope.initLeaflet();
  // // get the commit data immediately
  // $scope.getGeoPlanetData();

/*
leafletDemoApp.directive('geoplanetLeaflet', function ($rootScope, $log) {
  //constants
  var lat = 40.001;
  var lon = -104.01;

  var defaults = {
      maxZoom: 14,
      minZoom: 1,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      tileLayer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      tileLayerOptions: {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      icon: {
        url: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-icon.png',
        retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-icon@2x.png',
        size: [25, 41],
        anchor: [12, 40],
        popup: [0, -40],
        shadow: {
            url: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-shadow.png',
            retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-shadow.png',
            size: [41, 41],
            anchor: [12, 40]
        }
      },
      path: {
        weight: 10,
        opacity: 1,
        color: '#0000ff'
      },
      center: {
        lat: 0,
        lng: 0,
        zoom: 1
      }
  };

  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '='
    },
    link: function ($scope, element, attrs) {
      $log.log('setting up directive with link function');
//
      $scope.leaflet = {};

	  $scope.leaflet.maxZoom = !!(attrs.defaults && $scope.defaults && $scope.defaults.maxZoom) ?
	      parseInt($scope.defaults.maxZoom, 10) : defaults.maxZoom;
	  $scope.leaflet.minZoom = !!(attrs.defaults && $scope.defaults && $scope.defaults.minZoom) ?
	      parseInt($scope.defaults.minZoom, 10) : defaults.minZoom;
	  $scope.leaflet.doubleClickZoom = !!(attrs.defaults && $scope.defaults && (typeof($scope.defaults.doubleClickZoom) === "boolean") ) ? $scope.defaults.doubleClickZoom  : defaults.doubleClickZoom;
	  $scope.leaflet.scrollWheelZoom = !!(attrs.defaults && $scope.defaults && (typeof($scope.defaults.scrollWheelZoom) === "boolean") ) ? $scope.defaults.scrollWheelZoom  : defaults.scrollWheelZoom;

	  var map = new L.Map(element[0], {
	    maxZoom: $scope.leaflet.maxZoom,
	    minZoom: $scope.leaflet.minZoom,
	    doubleClickZoom: $scope.leaflet.doubleClickZoom,
	    scrollWheelZoom: $scope.leaflet.scrollWheelZoom
	  });
	  map.setView([lat, lon], 9);
	  //
      // set up initial marker
      var map = new L.Map('map').setView([lat, lon], 9);
      L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	  }).addTo(map);

      L.marker([lat,lon]).addTo(map).bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
	
      $scope.$watch('data', function (newVal, oldVal) {
      	$log.log('newVal', newVal);
        // clear the elements inside of the directive
        
        // if 'val' is undefined, exit
        if (!newVal) {
          return;
        }

        // ignore the first time this is called
        if (newVal === oldVal) {
          return;
        }

        // reset popup state to false
        $scope.popup = false;

        // setup a watch on 'popup' to switch between views
        $scope.$watch('popup', function (newVal, oldVal) {
          // ignore first call which happens before we even have data from the Github API
          
          if (newVal) {
            console.log('they want the popup');
          } else {
            console.log('guess they dont any longer');
          }
        });
      });
    }
  }
});*/