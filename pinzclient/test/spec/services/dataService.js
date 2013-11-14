'use strict';

describe('Service: Dataservice', function () {

  // load the service's module
  beforeEach(module('pinzclientApp'));

  var $httpBackend, scope;

  // instantiate service
  var dataService;
  beforeEach(inject(function (_dataService_, $injector, $rootScope) {
    dataService = _dataService_;
    scope = $rootScope.$new();

    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');
    // backend definition common for all tests
    $httpBackend.when('POST', '/data').respond({
      "some": "data"
    });


  }));

  it('should do something', function () {
    expect(!!dataService).toBe(true);
  });

  it('should return a string when getData is called', function() {
    dataService.getData();
    expect(scope.pinzdata).toNotBe(null);
  })

});
