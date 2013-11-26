'use strict';

var snap = angular.module('modalApp', [
  '$strap.directives'
]);

snap.controller('ModalCtrl', ['$scope', '$modal', function($scope, $modal) {

  $scope.modal = {content: 'Hello Modal', saved: false};
  console.log('modal ctrl is alive');

  $scope.parentController = function(dismiss) {
    console.warn(arguments);
    // do something
    dismiss();
  }

}]);