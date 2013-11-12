'use strict';

angular.module('pinzclientApp')
  .controller('MainCtrl', function ($scope, Metadataservice) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    Metadataservice.setUrl('/metadata');
    Metadataservice.getMetadata(function(data) {
    	console.log('received data');
	    $scope.numDataFeeds = data.length;	
    });
    
  });
