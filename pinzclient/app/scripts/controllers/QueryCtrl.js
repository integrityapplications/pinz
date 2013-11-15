'use strict';

angular.module('pinzclientApp')
  .controller('QueryCtrl', function($scope, Metadataservice) {
    Metadataservice.getMetadata(function(dataSources) {
    	$scope.dataSources = dataSources;
    })

    console.log("Hello from QueryCtrl");
    
  });
