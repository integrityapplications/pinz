//Query tab directive
'use strict';

angular.module('modalApp')
	.directive("queryBuilder" , function(){

		return {
			restrict: "A",
			templateUrl: "/views/query-modal-template.html"
		}
	});