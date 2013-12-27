'use strict';

angular.module('modalApp')
  .controller('QCtrl', ['$scope', '$log', 'Metadataservice', 'dataService', function($scope, $log, Metadataservice, dataService) {
  	console.log("QCtrl is active");
    
  	// a data object to store user input
	$scope.inputQuery = null;

	// a 'validated' object that is sent to the server.  Only contains properties that have been edited/set by user.
	$scope.dataQuery = {};

	$scope.serverQuery = {};


    Metadataservice.getMetadata(function(dataSources) {
    	$scope.dataSources = dataSources;
    	$log.log('dataSources: ', JSON.stringify(dataSources, undefined, 2));

    	// if($scope.inputQuery === null || typeof $scope.inputQuery === "undefined") {
    	// 	createDefaultQuery();
    	// 	createEmptyDataQuery();
    	// }

    });
    
}]);



