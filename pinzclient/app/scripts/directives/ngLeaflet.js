'use strict';

var map;
var leafletError;

angular.module('pinzclientApp')
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
      scope: {
              pinz: '='
      },	
      template: '<div id="leafletData"></div>',
      compile: function compile(tElement, tAttrs, transclude) {
        return {
          //pre: function preLink(scope, iElement, iAttrs, controller) {  },
          post: function postLink(scope, iElement, iAttrs, controller) { 
            console.log('post link compile', lMap);
            if (lMap === null || typeof lMap === "undefined") {
              console.log('map is undefined, re init');
              lMap = initLeaflet();
            } else {
              /* dirty dirty hacking */
              console.log('map is hidden but alive: ', map.getSize());
              try {
                map = initLeaflet();
              } catch (e) {
                // gulp
                // TODO - FIX THIS
                console.error('Swalled an error: ', e.message);
              }
              
            }
          }
        }
      },
      link: function postLink(scope, element, attrs) {
        //element.text('this is the ngLeaflet directive');
        console.log('postLink() of leaflet dir called');

        var overlays = null;
        var markers = new Array();

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
         		var sources = {},
         			colours = ['red','green','blue'];
         		
         		// Just a hack for now, this should come from real data not
         		// metadata. But shows multiple layers with a name of src
         		// and how many items were received.
         		if (!overlays) {
         			overlays = {};
         			latestPinz.forEach(function(item, index) {
	         			if (!sources[item.src]) { 
	         				sources[item.src] = 0;
	         			}
	         			sources[item.src] += 1;
	         		});
         			console.log("what are our data sources? ", sources);
	         		//var markers = new Array();
	         		Object.keys(sources).forEach(function(item, index) {
	         			// create a layer for each data source
	         			markers[index] = new L.LayerGroup();
	         			// add this to the overlays object
	         			console.log("src name ", item, "index", index);
	         			overlays[item + sources[item].toString()] = markers[index];

	         		});
         			L.control.layers(null, overlays, {collapsed:false}).addTo( map );	
         		}

         	if (markers && overlays) {
         		latestPinz.forEach(function(item, index) {
         			var lon = item.geos[0].loc.coordinates[0],
         				lat = item.geos[0].loc.coordinates[1];
         			markers[0].addLayers(
         				new L.Marker([lon, lat]).bindPopup(item.id + "occurred at " + item.t));
         		});
         		//L.marker([lat,lon]).addTo(map).bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
         	
         		}
         	}
        })
      }
    };
  });
