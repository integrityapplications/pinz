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

      var mapDraw = L.map('mapdraw', {"crs" : L.CRS.EPSG4326 , "center": [51.505, -0.09], "zoom": 5});

      var drawControl = new L.Control.Draw(options);
      mapDraw.addControl(drawControl);  	
      
      
      mapDraw.addLayer(drawnItems);

      var bluemarble = L.tileLayer.wms('http://localhost:8085/wms', {
        layers : 'bmng200401' ,
        attribution: "Data &copy; NASA Blue Marble",
        minZoom: 3,
        maxZoom: 11,
        maxBounds: L.LatLngBounds( L.LatLng(-90,-180), L.LatLng(90,180) ) // sw, ne
      });

      mapDraw.addLayer(bluemarble);


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
          console.log('layer keys ', Object.keys(layer));
          console.debug('debug layer ', layer);
          var layerId = layer._leaflet_id.toString();
          console.log('layer id ', layerId);
          shapes.push({ "layerId" : layerId, "geojson" : layer.toGeoJSON()});
          setCustomShapes(shapes);
          drawnItems.addLayer(layer);
      });

      mapDraw.on('draw:edited', function (e) {
          var layers = e.layers;
          layers.eachLayer(function (layer) {
              var layerId = layer._leaflet_id.toString();
              console.log('edited layer ', layerId);
              var numShapes = shapes.length;
              for (var i = 0; i < numShapes; i++) {
                console.log('looking for shape ', shapes[i].layerId);
                if (shapes[i].layerId === layerId) {
                  shapes[i].geojson = layer.toGeoJSON();
                  console.log("edited and saved layer ", layerId);
                }
              }
          });
          setCustomShapes(shapes);
      });

      mapDraw.on('draw:deleted', function (e) {
          var layers = e.layers;
          layers.eachLayer(function (layer) {
              var layerId = layer._leaflet_id.toString();
              var numShapes = shapes.length;
              for (var i = numShapes-1; i > -1; i--) {
                if (shapes[i].layerId === layerId) {
                  var removed = shapes.splice(i, 1); 
                  console.log("removed layer ", layerId);
                }
              }
          });
          setCustomShapes(shapes);
      });

      $('#myModal').on('show.bs.modal', function(){
        console.log('redraw the map?');
        setTimeout(function() {
          mapDraw.invalidateSize();
        }, 2000);
       });
  	}

    return {
      template: '<div id="mapdraw" style="height: 600px; width: 1000px"></div>',
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
