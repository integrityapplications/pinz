'use strict';

describe('Controller: GeoinputcontrollerCtrl', function () {

  // load the controller's module
  beforeEach(module('pinzclientApp'));

  var GeoinputcontrollerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GeoinputcontrollerCtrl = $controller('GeoinputcontrollerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
