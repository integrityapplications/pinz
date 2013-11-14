'use strict';

angular.module('pinzclientApp')
  .directive('ngLeaflet', function () {
  	var map; 

  	function initLeaflet() {
	    var cLat = -37.81, cLon = 144.93;
	    map = L.map('map',{  fullscreenControl: true }).setView([cLat, cLon], 11 ); 

	    //L.control.mousePosition().addTo(map);
	    var tileLayer = 
	    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	      maxZoom: 18,
	      minZoom: 2,
	      maxBounds: L.LatLngBounds( L.LatLng(-90,-180), L.LatLng(90,180) ) // sw, ne
	    });
	    map.addLayer( tileLayer );

	    var overlays = {};
	    var markers =[ new L.LayerGroup(),  new L.LayerGroup(), new L.LayerGroup() ];
	    for ( var i=0; i<markers.length; i++ ){
	      map.addLayer(markers[i]);
	      overlays[ "data " + (i+1) ] = markers[i];
	    }
	    L.control.layers(null, overlays, {collapsed:false}).addTo( map );

	    //var baseLayers = {
	    //"CloudMade": tileLayer
	    //};
	    return map;
	
    }

    var lMap = initLeaflet();

    return {
      restrict: 'A',
      scope: {
              pinz: '=',
              metadata: '='
      },	
      template: '<div id="map"></div>',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the ngLeaflet directive');
        console.log('init leaflet with $rootScope metadata ', scope.metadata);

        scope.$watch('pinz', function(latestPinz, prevPinz) {
        	//element.text('new name: ', newname, ' was: ', oldname);
         	//updateElement(element, newname);
         	if (typeof latestPinz !== 'undefined') {
         		console.log('latest pinz: ', latestPinz);
         		if (typeof prevPinz !== 'undefined') {
         			console.log('new pinz: ', latestPinz.length - prevPinz.length,
         						' (', latestPinz.length, ' - ', prevPinz.length,')');
         			element.text('Latest pinz ' + latestPinz.length);
         		}
         	}

        })
      }
    };
  });
