'use strict';

angular.module('modalApp')
  .service('Metadataservice', function Metadataservice($http, $log) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var metadataUrl = "/metadata";

    return {
    	getUrl: function() {
    		return metadataUrl;
    	},
    	setUrl: function(url) {
    		metadataUrl = url;
    		$log.log("url: ", metadataUrl);
    	},
    	getMetadata: function(successCallback) {
    		$http({
		        method: 'GET',
		        url: metadataUrl
		    }).success(function(data, status, headers) {
                console.log("success");
                successCallback(data);
            });
    	}
    }
  });
