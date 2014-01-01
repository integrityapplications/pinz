'use strict';

angular.module('modalApp')
  .directive('pinzLeafletDraw', function () {

  	function initLeafletDraw(setCustomShapes, addCustomShape) {

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
                      color: '#377ed8'
                  }
              },
              circle: false, // Turns off this drawing tool
              rectangle: {
                  shapeOptions: {
                      color: '#377eb8',
                      weight: 5
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
      var shapes = [];
      mapDraw.on('draw:created', function (e) {
          var type = e.layerType,
              layer = e.layer; 
              /* layer is a Leaflet shape
               * i.e. http://leafletjs.com/reference.html#polygon
               */

          console.log("created layer geojson ", layer.toGeoJSON());
          if (type === 'marker') {
              layer.bindPopup('A popup!');
          } else {
            layer.bindPopup(type + " popup");
          }
          shapes.push(layer.toGeoJSON());
          setCustomShapes(shapes);
          drawnItems.addLayer(layer);
      });

      mapDraw.on('draw:edited', function (e) {
          var layers = e.layers;
          shapes = [];
          console.log("typeof layers: ", typeof layers, " plus ", Object.keys(layers._layers));

          console.log("edited. Now have ", layers._layers.length, " features ");
          layers.eachLayer(function (layer) {
              console.log("edited layer geojson ", layer.toGeoJSON());
              shapes.push(layer.toGeoJSON());
          });
          setCustomShapes(shapes);
      });

      mapDraw.on('draw:deleted', function (e) {

          var layers = e.layers;
          shapes = [];
          console.log("typeof layers: ", typeof layers, " plus ", Object.keys(layers));
          console.log("deleted a feature. Now have layers ", Object.keys(layers._layers));
          layers.eachLayer(function (layer) {
              console.log("deleted layer geojson ", layer.toGeoJSON());
              shapes.push(layer.toGeoJSON());
          });
          setCustomShapes(shapes);
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
        customGeos : "="
      },
      link: function ($scope, element, attrs) {
        var customShapes = [];
        function addCustomShape(geoJsonShape) {
          $scope.$apply(function() {
            console.log("what was custom shape? ", $scope.customGeos);
            console.log("what was local custom shapes: ", customShapes);
            customShapes.push(geoJsonShape);
            $scope.customGeos = customShapes;
            console.log("custom geos is now: ", $scope.customGeos);
          })
          $scope.$digest();
        }
        function setCustomShapes(geoJsonShapes) {
          console.log("geoJsonShapes to reset to: ", geoJsonShapes);
          $scope.$apply(function() {
            console.log("reset custom shapes (was previously): ", $scope.customGeos);
            $scope.customGeos = geoJsonShapes;
          })
          $scope.$digest();

        }
        console.log('do the map draw thing', $scope.customShape);
        //element.css({"height": "300px"})
        initLeafletDraw(setCustomShapes, addCustomShape);
      }
    }
  });
