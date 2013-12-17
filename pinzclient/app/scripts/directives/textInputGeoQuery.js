'use strict';

angular.element(document).ready(function() {
	console.log('text input geo query');
})

angular.module('modalApp')
  .directive('pinzTextInputGeoQuery', function ($compile) {
    return {
      templateUrl: '/views/textGeoInputTemplate.html',
      restrict: 'A',
    //   replace: true,
		  // scope: {
				// inputLatitude: '=',
				// inputLongitude: '='
		  // },
		  controller: function($scope) {
		  	$scope.printLatLon = function() {
		  		console.log('from within dir controller ', $scope.inputLatitude, $scope.inputLongitude);
		  	}
		  	$scope.validLat = false;
		  	var latRegEx = /^(?:90|[0-8][0-9]):[0-5][0-9]:[0-5][0-9][NS]$/;
		  	$scope.validateInput = function() {
		  		//pattern/.test(txt);
		  		if (latRegEx.test($scope.inputLatitude)) {
		  			$scope.validLat = true;
		  		} else {
		  			$scope.validLat = false;
		  		}
		  		console.log('validLat', $scope.validLat);
		  		$scope.$apply();

		  	}
		  },
      link: function postLink($scope, element, attrs, ctrl) {
				console.log('do something in the link function?'); 
				console.debug('$scope ', $scope);
				element.on('keyup', function() {
					console.log('$scope.inputLat and long ', $scope.inputLatitude, $scope.inputLongitude);
					$scope.validateInput();
				})
				console.debug('ctrl', ctrl);
	  	}
    };
  });
