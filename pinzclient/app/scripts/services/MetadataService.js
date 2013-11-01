'use strict';

angular.module('pinzclientApp')
  .service('Metadataservice', function Metadataservice($http, $log) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var metadataUrl = "http://localhost:3000/metadata";

    return {
    	getUrl: function() {
    		return metadataUrl;
    	},
    	setUrl: function(url) {
    		metadataUrl = url;
    		$log.log("url: ", metadataUrl);
    	},
    	getMetadata: function(callback) {
    		$http({
		        method: 'GET',
		        url: metadataUrl
		    }).success(function (data) {
		    	return data;
		   	});
    	}
    }
  });
