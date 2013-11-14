'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('pinzclientApp'));

  var $httpBackend, $rootScope;

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });

    // Set up the mock http service responses
     $httpBackend = $injector.get('$httpBackend');
     // backend definition common for all tests
     $httpBackend.when('GET', '/metadata').respond({
      "_id" : "A",
      "desc" : "Human readable data definition for source A - what it is, where it comes from, kind of info it contains.",
      "attrs" : [
        {
          "name" : "color",
          "type" : "string",
          "desc" : "Property to describe the physical color of the A observable.",
          "values" : [
            "red",
            "green",
            "blue",
            "white",
            "brown"
          ]
        },
        {
          "name" : "animal",
          "type" : "string",
          "desc" : "The type of animal in the observable.",
          "values" : [
            "croc",
            "koala",
            "kangaroo",
            "cockatoo"
          ]
        },
        {
          "name" : "weight",
          "type" : "number",
          "desc" : "The mass of the animal in the observable.",
          "low" : 0,
          "high" : 100,
          "units" : "kg"
        }
      ]});
  }));

  afterEach(function(){ 
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  })

  it('should make a request for metadata', function () {
    $httpBackend.expectGET("/metadata");
  });
});
