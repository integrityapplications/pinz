'use strict';

angular.module('modalApp')
  .controller('ModalCtrl', function ($scope, $modal, $q) {

  $scope.queryOpened = false;

  $scope.showModal = function() {
    var modalPromise = $modal({
      content: "Hello Modal",
      template: 'views/query-modal-template.html',
      persist: true,
      show: true,
      saved: false,
      backdrop: 'static',
      scope: $scope});
	  $q.when(modalPromise).then(function(modal) {
	      console.log("go");
	      modal.modal("show");
	      $scope.queryOpened = true;
	});
  };

  angular.element(document).ready(function() {
     if (!$scope.queryOpened) {
        $scope.showModal();
    }   
  })
 
});
