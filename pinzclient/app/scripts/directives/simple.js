'use strict';

// do not instantiate a new app!  The angular.module('nameOfApp' , []) => a new app...
// Use angular.module('nameOfApp').whatever will append to existing app!
angular.module('pinzclientApp').directive('simple' , function() {
	return {
		// set data from model?
		restrict: 'E',
		template: '<div>I am a directive</div>'
	}
});