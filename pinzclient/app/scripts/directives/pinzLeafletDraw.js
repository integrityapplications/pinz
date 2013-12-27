'use strict';

angular.module('modalApp')
  .directive('pinzLeafletDraw', function () {

  	function initLeafletDraw(setCustomShape) {

      var drawnItems = new L.FeatureGroup();
  	  // create a map in the "map" div, set the view to a given place and zoom
      var options = {
          position: 'topleft',
          draw: {
              polyline: false,
              polygon: {
                  allowIntersection: false, // Restricts shapes to simple polygons
                  drawError: {
                      color: '#e1e100', // Color the shape will turn when intersects
                      message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                  },
                  shapeOptions: {
                      color: '#377eb8'
                  }
              },
              circle: false, // Turns off this drawing tool
              rectangle: {
                  shapeOptions: {
                      color: '#377eb8',
                      weight: 5,
                  }
              },
              marker: false
          },
          edit: {
              featureGroup: drawnItems, //REQUIRED!!
              remove: true,
              edit: true
          }
      };

      var mapDraw = L.map('mapdraw', {"center": [51.505, -0.09], "zoom": 10});

      var drawControl = new L.Control.Draw(options);
      mapDraw.addControl(drawControl);  	
      
      
      mapDraw.addLayer(drawnItems);
  		// add an OpenStreetMap tile layer
  		//L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  	  //  	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  		//}).addTo(mapDraw);
      L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18,
        minZoom: 1,
        maxBounds: L.LatLngBounds( L.LatLng(-90,-180), L.LatLng(90,180) ) // sw, ne
      }).addTo(mapDraw);

      mapDraw.on('draw:created', function (e) {
          var type = e.layerType,
              layer = e.layer; 
              /* layer is a Leaflet shape
               * i.e. http://leafletjs.com/reference.html#polygon
               */

          console.log("layer geojson ", layer.toGeoJSON());
          if (type === 'marker') {
              layer.bindPopup('A popup!');
          } else {
            layer.bindPopup(type + " popup");
          }

          setCustomShape(layer.toGeoJSON());
          drawnItems.addLayer(layer);
      });
      console.log('finished initing leaflet draw');

      $('#myModal').on('show.bs.modal', function(){
        console.log('redraw the map?');
        setTimeout(function() {
          mapDraw.invalidateSize();
        }, 2000);
       });
  	}

    return {
      template: '<div id="mapdraw" style="height: 300px;"></div>',
      restrict: 'A',
      scope: {
        customGeo : "="
      },
      link: function ($scope, element, attrs) {
        function setCustomShape(geoJsonShape) {
          $scope.$apply(function() {
            console.log("what was custom shape? ", $scope.customGeo);
            $scope.customGeo = geoJsonShape;
          })
        }
        console.log('do the map draw thing', $scope.customShape);
        //element.css({"height": "300px"})
        initLeafletDraw(setCustomShape);
      }
    }
  });
