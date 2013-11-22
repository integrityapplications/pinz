'use strict';

angular.module('pinzclientApp')
  .controller('MainCtrl', ['$scope', 'Metadataservice', 'dataService', function($scope, Metadataservice, dataService) {
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
   console.log('dataService dataQuery ', dataService.dataQuery);
    
  }]);
