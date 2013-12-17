'use strict';

angular.module('modalApp')
  .controller('GeoInputController', function ($scope) {
    //$scope.latitude="33.33";
    //$scope.longitude="130.44";

    console.log('if i\'m not in the page...');

    $scope.printCtrlLatLon = function() {
    	console.log("lat lon ", $scope.latitude, $scope.longitude);
    }
  });
