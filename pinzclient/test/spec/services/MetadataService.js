'use strict';

describe('Service: Metadataservice', function () {

  // load the service's module
  beforeEach(module('pinzclientApp'));

  var $httpBackend, $rootScope;

  // instantiate service
  var Metadataservice;
  beforeEach(inject(function (_Metadataservice_, $injector) {
    Metadataservice = _Metadataservice_;

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
 
     // Get hold of a scope (i.e. the root scope)
     $rootScope = $injector.get('$rootScope');
     
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return url', function () {
    expect(Metadataservice.getUrl()).toBe("/metadata");
  });

  it('should set the url and return it', function() {
    Metadataservice.setUrl('/metadata');
    expect(Metadataservice.getUrl()).toBe("/metadata");
  });

  it('should get data from the url', function() {
    Metadataservice.setUrl('/metadata');
    //Metadataservice.getMetadata();
    Metadataservice.getMetadata(function(data) {
      expect(data.desc).toContain("Human readable");
    });
    $httpBackend.expectGET("/metadata");
  });

});
