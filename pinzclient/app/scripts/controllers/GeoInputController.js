'use strict';

angular.module('modalApp')
  .controller('GeoInputController', function ($scope) {
    $scope.ulLatitude="33.33";
    $scope.ulLongitude="130.44";
    $scope.lrLatitude="30.33";
    $scope.lrLongitude="131.44";
    $scope.customShape={};
    $scope.bbox = {};
    $scope.bbox.ulError = false;
    $scope.bbox.lrError = false;
    $scope.bbox.ulErrorMessage = "";
    $scope.bbox.lrErrorMessage = "";
    $scope.bbox.initialized = false;

    $scope.printCtrlLatLon = function() {
    	if ($scope.bbox.ulLatitude || $scope.bbox.initalized) {
    		console.log("bbox: ", $scope.bbox);
    	} else {
    		console.log("custom shape: ", $scope.customShape);
    	}
    }

    $scope.$watch("customShape", function(newShape, oldShape) {
    	console.log("GeoCtrl $watch - shape they just drew: ", newShape);
        // Set global geo (applies to all sources) to a single shape.
        // TODO: Fix directive to report an array of arrays (points representing a polygon)
        //       or whatever is consistent with server api.

        var queryCoords = []; // Seems our query API just wants a single polygon as a simple list of lat lon pairs
        if (newShape !== null && typeof newShape !== "undefined" && $.isEmptyObject(newShape) !== true) {

            console.log("How many polys? " + newShape.geometry.coordinates.length);
            console.log("How many points in first poly? " + newShape.geometry.coordinates[0].length);
            console.log("How many coords in first point of first poly? " + newShape.geometry.coordinates[0][0].length);

            for(var coordIdx = 0; coordIdx < newShape.geometry.coordinates[0].length; coordIdx++) {
                queryCoords.push(newShape.geometry.coordinates[0][coordIdx][0]);
                queryCoords.push(newShape.geometry.coordinates[0][coordIdx][1]);
            }

            $scope.$parent.inputQuery.globalGeo = queryCoords;

        }
        console.log("\tQuery coords = " , queryCoords);
    });

  });
