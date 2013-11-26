'use strict';

describe('Directive: ngLeaflet', function () {

  // load the directive's module
  beforeEach(module('pinzclientApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should draw a map on the page', inject(function ($compile) {
    element = angular.element('<ng-leaflet></ng-leaflet>');
    element = $compile(element)(scope);
    expect(element.id()).toBe('map');
  }));
});