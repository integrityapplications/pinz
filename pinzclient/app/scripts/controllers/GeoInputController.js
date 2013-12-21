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

    /*$scope.$watch("customShape", function(newShape, oldShape) {
    	console.log("GeoCtrl $watch - shape they just drew: ", newShape);
    })*/
  });
