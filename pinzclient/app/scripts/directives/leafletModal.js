'use strict';

var map;
var leafletError;

angular.module('modalApp')
  .directive('ngLeaflet', function () {
  	//var map; 
    console.log('ngleaflet directive is active');

  	function initLeaflet() {
	    var cLat = -37.81, cLon = 144.93;
	    map = L.map('map',{  fullscreenControl: true }).setView([cLat, cLon], 2 ); 

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
	    var tileLayer = 
	    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	      maxZoom: 18,
	      minZoom: 1,
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
      template: '<div id="leafletData"></div>',
      scope: {
              pinz: '='
      },
      link: function postLink(scope, element, attrs) {
        //element.text('this is the ngLeaflet directive');
        console.log('postLink() of leafletModal dir called');

        var overlays = null;
        var pinzLayerGroup = new Array();

        scope.$watch('pinz', function(latestPinz, prevPinz) {
        	console.log('pinz data was updated');
        	//element.text('new name: ', newname, ' was: ', oldname);
         	//updateElement(element, newname);
         	if (typeof latestPinz !== 'undefined') {
         		console.log("we received new data ", latestPinz.length);
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
	         			pinzLayerGroup[index] = new L.LayerGroup();
	         			// add this to the overlays object
	         			console.log("src name ", item, "index", index);
	         			overlays[item + sources[item].toString()] = pinzLayerGroup[index];

	         		});
         			L.control.layers(null, overlays, {collapsed:false}).addTo( map );

	         		latestPinz.forEach(function(item, index) {
	         			var lon = item.geos[0].loc.coordinates[0],
	         				lat = item.geos[0].loc.coordinates[1];
	         			var popupText = item.id + " occurred at "+ item.t;
	         			
	         			if (typeof item.attrs !== "undefined") {
	         				Object.keys(item.attrs).forEach(function(attr, attrIndex) {
	         					if (index < 10) { console.log('item.attrs ', JSON.stringify(item.attrs), ' attr: ', attr);}
	         					popupText += "<br>";
	         					popupText += attr + " : " + item.attrs[attr].v;
	         				});
	         			}

	         			pinzLayerGroup[0].addLayer(
	         				new L.Marker([lat, lon]).bindPopup(popupText));
	         		});
	         		//L.marker([lat,lon]).addTo(map).bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
	         	
         		}

	         
         	 }
        })
      }
    };
  });