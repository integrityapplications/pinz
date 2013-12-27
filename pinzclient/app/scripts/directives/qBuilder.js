//Query tab directive
'use strict';

console.log('qBuilder');

angular.module('modalApp')
	.directive("queryBuilder" , function(){

		console.log('insert query template ');

		return {
			restrict: "A",
			templateUrl: "/views/query-template.html"
		}
	});