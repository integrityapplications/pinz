'use strict';

angular.module('pinzclientApp')
  .directive('ngLeaflet', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the ngLeaflet directive');
      }
    };
  });
