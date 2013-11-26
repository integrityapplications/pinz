'use strict';

var map;
var leafletError;

angular.module('snapApp')
  .directive('ngLeaflet', function () {
  	//var map; 
    console.log('ngleaflet directive is active');

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
	    //var baseLayers = {
	    //"CloudMade": tileLayer
	    //};
	    return map;
	
    }

    var lMap = initLeaflet();
    console.log('map size ', lMap.getSize())

    return {
      restrict: 'A',
      template: '<div id="leafletData"></div>'
    };
  });
