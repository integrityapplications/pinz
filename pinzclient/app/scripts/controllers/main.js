'use strict';

angular.module('pinzclientApp')
  .controller('MainCtrl', ['$scope', 'Metadataservice', function($scope, Metadataservice) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    Metadataservice.setUrl('/metadata');
    Metadataservice.getMetadata(function(data) {
    	console.log('received metadata', data);
	    $scope.numDataFeeds = data.length;
	    $scope.pinzMetadata = data;
    });
    
  }]);
