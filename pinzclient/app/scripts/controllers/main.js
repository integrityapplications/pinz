'use strict';

angular.module('pinzclientApp')
  .controller('MainCtrl', function ($scope, Metadataservice) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    Metadataservice.setUrl('/metadata');
    var data = Metadataservice.getMetadata();
    $scope.numDataFeeds = data.length;
  });
