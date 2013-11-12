'use strict';

angular.module('pinzclientApp')
  .directive('ngLeaflet', function () {
  	function updateElement(element, newName) {
  		element.text(newName);
  		//console.log('element ', element, ' new name: ', newName);
  	};

    return {
      restrict: 'A',
      scope: {
              pinz: '='
      },	
      template: '<div></div>',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the ngLeaflet directive');
        console.log('directive has fired and has access to city?');
        scope.$watch('pinz', function(newname, oldname) {
        	//element.text('new name: ', newname, ' was: ', oldname);
         	updateElement(element, newname);
        })
      }
    };
  });
