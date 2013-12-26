//Query tab directive
'use strict';

angular.module('modalApp')
	.directive("qBuilder" , function(){

		console.log('insert query template ');

		return {
			restrict: "A",
			templateUrl: "/views/query-template.html"
		}
	});