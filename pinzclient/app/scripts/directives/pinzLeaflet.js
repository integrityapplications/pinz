'use strict';

var map;
var leafletError;

angular.module('modalApp')
  .directive('pinzLeaflet', function () {
  	//var map; 
    console.log('pinzLeaflet directive is active');

  	function initLeaflet() {
	    var cLat = -37.81, cLon = 144.93;
	    
		map = L.map('map' , { "crs" : L.CRS.EPSG4326 , "fullscreenControl" : true , "center": [cLat, cLon], "zoom": 4} );
	    
	    L.control.coordinates({
		    position:"bottomleft", //optional default "bootomright"
		    decimals:2, //optional default 4
		    decimalSeperator:".", //optional default "."
		    labelTemplateLat:"Lat: {y}", //optional default "Lat: {y}"
		    labelTemplateLng:"Lon: {x}", //optional default "Lng: {x}"
		    //enableUserInput:true, //optional default true
		    useDMS:false, //optional default false
		    useLatLngOrder: true //ordering of labels, default false-> lng-lat
		}).addTo(map);

	    var bluemarble = L.tileLayer.wms('http://localhost:8085/wms', {
        	layers : 'bmng200401' ,
        	attribution: "Data &copy; NASA Blue Marble",
        	minZoom: 3,
        	maxZoom: 11,
        	maxBounds: L.LatLngBounds( L.LatLng(-90,-180), L.LatLng(90,180) ) // sw, ne
      	});

      	map.addLayer(bluemarble);

	    var overlays = {};
	    //var baseLayers = {
	    //"CloudMade": tileLayer
	    //};
	    return map;
	
    }

    var lMap = initLeaflet();

    function putPinzOnMap(latestData, overlays, sourcesInfo) {
    	var colours = ['red','green','blue', 'orange', 'yellow', 'white'];
    	var step = 0, prevSrc = latestData[0].src;
    	var numOfSteps = Object.keys(sourcesInfo).length;
    	if (numOfSteps < 4) { 
    		numOfSteps = numOfSteps + (4 - numOfSteps);
    	}
	    latestData.forEach(function(item, index) {
	    	if (item.src !== prevSrc) { 
	    		prevSrc = item.src;
	    		step += 1;
	    	}
			var lon = item.geos[0].loc.coordinates[0],
				lat = item.geos[0].loc.coordinates[1];
			var popupText = item.id + " occurred at "+ item.t;
			
			if (typeof item.attrs !== "undefined") {
				Object.keys(item.attrs).forEach(function(attr, attrIndex) {
					popupText += "<br>";
					popupText += attr + " : " + item.attrs[attr].v;
				});
			}

			var itemColor = rainbow(numOfSteps, step);
			var circleMarkerOpts = {
				"radius": 5,
				"color": itemColor
			}
			overlays[item.src].addLayer(new L.CircleMarker([lat, lon], circleMarkerOpts).bindPopup(popupText));
		});
	}	   

	var rainbow = function (numOfSteps, step) {
	    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
	    // Adam Cole, 2011-Sept-14
	    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
	    var r, g, b;
	    var h = step / numOfSteps;
	    var i = ~~(h * 6);
	    var f = h * 6 - i;
	    var q = 1 - f;
	    switch(i % 6){
	        case 0: r = 1, g = f, b = 0; break;
	        case 1: r = q, g = 1, b = 0; break;
	        case 2: r = 0, g = 1, b = f; break;
	        case 3: r = 0, g = q, b = 1; break;
	        case 4: r = f, g = 0, b = 1; break;
	        case 5: r = 1, g = 0, b = q; break;
	    }
	    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
	    return (c);
	}  

    return {
      restrict: 'A',
      template: '<div id="pinzLeafletData"></div>',
      scope: {
              pinz: '='
      },
      link: function postLink(scope, element, attrs) {
        //element.text('this is the ngLeaflet directive');

        var overlays = null;
        var pinzLayerGroup = new Array();

        scope.$watch('pinz', function(latestPinz, prevPinz) {
        	//element.text('new name: ', newname, ' was: ', oldname);
         	//updateElement(element, newname);
         	if (typeof latestPinz !== 'undefined' && latestPinz.length > 0) {
         		console.log("we received new data ", latestPinz.length);
         		if (typeof prevPinz !== 'undefined') {
         			console.log('new pinz: ', latestPinz.length,
         						' old pinz: ', prevPinz.length);
         			element.text('Latest pinz ' + latestPinz.length);
         		}
         		var sources = {},
         			colours = ['red','green','blue','orange','yellow','white','black','purple'];
         		latestPinz.forEach(function(item, index) {
	         		if (!sources[item.src]) { 
	         			sources[item.src] = {};
	         			sources[item.src].count = 0;
	         			sources[item.src].colour = rainbow(item.src.length, 15);
	         		}
	         		sources[item.src].count += 1;
	         	});

         		// Clear existing layers TODO: make this better
	         	Object.keys(sources).forEach(function(item, index) {
	         		if(pinzLayerGroup[index] !== null && typeof pinzLayerGroup[index] !== "undefined") {
	         			pinzLayerGroup[index].clearLayers();
	         		}
	         	});

	         	var latestData = angular.copy(latestPinz);
         		
         		if (!overlays) {
         			overlays = {};
         			
	         		//var markers = new Array();
	         		Object.keys(sources).forEach(function(item, index) {
	         			// create a layer for each data source
	         			pinzLayerGroup[index] = new L.LayerGroup();
	         			// add this to the overlays object
	         			overlays[item] = pinzLayerGroup[index];

	         		});
         			L.control.layers(null, overlays, {collapsed:false}).addTo( map );

	         		putPinzOnMap(latestData, overlays, sources);   		
	         		//L.marker([lat,lon]).addTo(map).bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
	         	
         		} else {	
         			putPinzOnMap(latestData, overlays, sources); 
         		}
	         
         	}
        })
      }
    };
  });