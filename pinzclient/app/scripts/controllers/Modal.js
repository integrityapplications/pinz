'use strict';

angular.module('modalApp')
  .controller('ModalCtrl', function ($scope) {

    $scope.modal = {
	  "content": "Hello Modal",
	  "saved": false
	}
  });
