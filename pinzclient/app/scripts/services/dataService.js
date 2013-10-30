'use strict';

angular.module('pinzclientApp')
  .service('dataService', function dataService() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var ds = {};
    ds.getData = function() {
    	return "some string";
    }
    return ds;
  });
