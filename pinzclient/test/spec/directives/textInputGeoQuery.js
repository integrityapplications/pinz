'use strict';

describe('Directive: textInputGeoQuery', function () {

  // load the directive's module
  beforeEach(module('pinzclientApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<text-input-geo-query></text-input-geo-query>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the textInputGeoQuery directive');
  }));
});
