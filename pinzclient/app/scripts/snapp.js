'use strict';

var snap = angular.module('snapApp', [
  'snap'
]);

snap.controller('SnapCtrl', ['$scope', function($scope) {
  console.log('snap ctrl is alive');
  $scope.contentText = "Lorem snapsum";

  $scope.opts = {
    disable: 'right'
  };
}]);