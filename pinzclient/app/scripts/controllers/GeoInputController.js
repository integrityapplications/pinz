'use strict';

angular.module('modalApp')
  .controller('GeoInputController', function ($scope) {
    $scope.ulLatitude="33.33";
    $scope.ulLongitude="130.44";
    $scope.lrLatitude="30.33";
    $scope.lrLongitude="131.44";
    $scope.customShapes=[];
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
    		console.log("custom shape: ", $scope.customShapes);
    	}
    }

    $scope.$watchCollection("customShapes", function(newShapes, oldShapes) {
    	console.log("GeoCtrl $watch - shapes they just drew: ", newShapes);
        // Set global geo (applies to all sources) to a single shape.
        // TODO: Fix directive to report an array of arrays (points representing a polygon)
        //       or whatever is consistent with server api.
        if (newShapes !== null && typeof newShapes !== "undefined" && newShapes.length > 0) {
            $scope.$parent.inputQuery.globalGeo = newShapes;

        }
    });

  });
