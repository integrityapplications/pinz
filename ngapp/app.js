// hackspaghettifest: to add new data source change these vars:
//   dataSources
//   geoData
//   markers
//   colours
//   heatmapGrads
// sorry :)


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

    $scope.map = map;
    $scope.layerType="points";
    $scope.historyAmt = 75.0;
    $scope.heatOpacity = 0.5;
    $scope.heatRadius = 10;
    // This is the marker data currently displayed.  A list, one for each data source.
    // todo: poor management having separate lists, should be objects.
    var overlays = {};
    markers =[ new L.LayerGroup(),  new L.LayerGroup(), new L.LayerGroup() ];
    for ( var i=0; i<markers.length; i++ ){
      map.addLayer(markers[i]);
      overlays[ "data " + (i+1) ] = markers[i];
    }

    L.control.layers(null, overlays, {collapsed:false}).addTo( map );

    // This array holds our point data.  Watch it and display when dirty.
    //
    // An array of arrays, one for each data source.  todo: better management together with layers
    //
    // Initialise it with some data.  Ideally we have some maximum number of
    // points ($scope.nbBuffered) and get this many most recent.  But the
    // data server doesn't have this yet.
    $scope.geoData = [[], [], []];
    $scope.pollingTimeout = 1;
    $scope.nbBuffered = 200;
    timeOfLastDataPull = moment();

    // fill buffer up.
    // todo: should call for each data source, but it's spaghetti code (global vars)
    $scope.getPinzData(true);
    map.fitWorld();

    // Doesn't work for some reason...
    // $scope.$watch( 'geoData', function(newVal, oldVal){
    //   $log.log( 'geoData changed, invoking display' );
    //   displayData( newVal[0], 0 );
    //   displayData( newVal[1], 1 );
    // });

    $scope.$watch( 'geoData[0]', function(newVal, oldVal){
      $log.log( 'geoData[0] changed, invoking display' );
      if (!(newVal instanceof Array)) { alert('newVal0 is not Array!'); } 
      if ( newVal.length > 0 ){ displayData( newVal, 0 );}
    });
    $scope.$watch( 'geoData[1]', function(newVal, oldVal){
      $log.log( 'geoData[1] changed, invoking display' );
      if (!(newVal instanceof Array)) { alert('newVal1 is not Array!'); } 
      if ( newVal.length > 0 ){ displayData( newVal, 1 ); }
    });
    $scope.$watch( 'geoData[2]', function(newVal, oldVal){
      $log.log( 'geoData[2] changed, invoking display' );
      if (!(newVal instanceof Array)) { alert('newVal2 is not Array!'); } 
      if ( newVal.length > 0 ){ displayData( newVal, 2 ); }
    });

  }

  dataSources = [
    // A
    {
      name: 'test source A',
      postDataTemplate: [
        {
          "src" : "A"
        }
      ]
    },
    // B
    {
      name: 'test source B',
      postDataTemplate: [
        {
          "src" : "B"
        }
      ]
    },
    // earthquake
    {
      name: 'source earthquake',
      postDataTemplate: [
        {
          "src" : "earthquake"
        }
      ]
    }
  ];


  var headersCfg = {"content-type":"application/json"};

  $scope.cancelDataFeed = null;

  function updateData() {
    $scope.getPinzData(false);
    $scope.cancelDataFeed = $timeout(function() {
      updateData();
      $scope.error = "polling for data...";
    }, $scope.pollingTimeout * 1000);
  } 

  $scope.startDataFeed = function() {
    console.log('start the data feed');
    updateData();
  }

  $scope.stopDataFeed = function() {
    console.log('stop the data feed');
    $timeout.cancel($scope.cancelDataFeed);
    $scope.error = "stopped";
  }

  //
  // If fillBuffer is true, initialise the buffer with $scope.nbBuffered most recent points.
  //
  $scope.getPinzData = function( fillBuffer ) { 
    $log.log('getPinzData: invoked');

    // Make an uber post request for all data sources at once.
    var postDataAll = [];

    for ( var ds=0; ds<dataSources.length; ds++ ){
      dataSource = dataSources[ds];

      // This is how you copy an object...wtf?
      var dummy = {};
      jQuery.extend(dummy,dataSource.postDataTemplate[0]);
      var postData = dummy;

      // set the time and geo params for the data query from the totally awesome data service.
      if ( fillBuffer ) {
        delete postData.time_within;
      } else {
        postData.time_within = {
          // todo: if inclusive bounds, double counted
          "start" : timeOfLastDataPull.toISOString(), 
          //moment().subtract('minutes',1).toISOString(),
          "end"   : moment().toISOString() // now
        };
        $log.log('Retrieving data with this time range: ', postData.time_within );
      }
      $log.log( 'after setting, postdata = ', postData );
      postDataAll.push(postData);
    }// for

    // Now post'em
      $http({
        method: 'POST',
        url:'/data',
        data:postDataAll,
        headers:headersCfg
      }).success(function (data) {
        if ( data.length  != 3 ) { alert('expected data length 3, got ', data.length); }
        for ( var ds=0; ds<dataSources.length; ds++ ){
          // attach this data to the scope.  It is an array of leaflet lat-long objects.
          var newData = reformatData(data[ds]);
          //$log.log('new data = ', newData);
          $log.log('callback is concating geoData for ds = ', ds);
          $scope.geoData[ds] = $scope.geoData[ds].concat( newData );
          $log.log('Before truncation, retrieved-and-concatenated geoData has length ', 
                   $scope.geoData[ds].length);

          // If we now have too much data, truncate
          if ( $scope.geoData[ds].length > $scope.nbBuffered ) {
            $scope.geoData[ds] = $scope.geoData[ds].slice( 
	       $scope.geoData[ds].length - $scope.nbBuffered );
          }
          $log.log('After truncation, geoData has length ', 
		   $scope.geoData[ds].length);
        }// for ds
        // todo:
        timeOfLastDataPull = moment();

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

  // Input is an array of arrays, one for each data source.
  function displayData( lfltPointsAll, ds ) {
    $log.log('displayData ',ds, ': start');
    if ( lfltPointsAll == null ) return;
    if (!(lfltPointsAll instanceof Array)) { alert('value is not Array!'); } 

    colours = ['red','green','blue'];
    // Which points to render?
    nbPtsToUse =  Math.round( lfltPointsAll.length * $scope.historyAmt / 100.0 );
    if ( nbPtsToUse == 0 ) return;

    // Get the end of the list because they should be in temporal order (todo: test that!)
    //$log.log( 'lfltPointsAll = ', lfltPointsAll);
    lfltPoints = lfltPointsAll.slice( lfltPointsAll.length - nbPtsToUse );
    
    // Remove previous map layer contents.
    markers[ds].clearLayers();

    $log.log( 'Data set ', ds, ': displaying ' + lfltPoints.length + ' data points with render option ', 
	     $scope.layerType );
    switch ($scope.layerType) {
      case 'points':
        for ( var i=0; i<Math.min(1000000000,lfltPoints.length); i ++ ){
          markers[ds].addLayer(new L.Marker( lfltPoints[i], { icon: L.spriteIcon( colours[ds] ) } ) );
      }
        break
      case 'cluster':
        var mcg = new L.MarkerClusterGroup();
        for ( var i=0; i<lfltPoints.length; i ++ ){
          mcg.addLayer(new L.Marker( lfltPoints[i], { icon: L.spriteIcon( colours[ds] ) } ) );
      }
        markers[ds].addLayer(mcg);
        break;
      case 'heat':
	var heatmapGrads = [{},{},{}];
	for ( var g=0.0; g<=1.0; g+=0.01 ){
	  heatmapGrads[0][g] = "rgb(" + Math.round(255*g) + ",0,0)";
	  heatmapGrads[1][g] = "rgb(0," + Math.round(255*g) + ",0)";
	  heatmapGrads[2][g] = "rgb(0,0," + Math.round(255*g) + ")";
        }
	$log.log('heatmaps = ', heatmapGrads);
        var heatmapLayer = L.TileLayer.heatMap({
          radius: $scope.heatRadius,
          opacity: $scope.heatOpacity,
          gradient: heatmapGrads[ds]
        });
        newPts = [];
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
        markers[ds].addLayer( heatmapLayer );

        var llbounds = [[lls,llw],[lln,lle]];
        console.log('lat long bounds = ', llbounds);
        break;
      default:
        $log.log( 'Undefined display type ' + $scope.layerType );
        break;
    }
    $log.log('displayData ',ds, ': finish');
  }

  $scope.initLeaflet();

});
