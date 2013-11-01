'use strict';

describe('Service: Metadataservice', function () {

  // load the service's module
  beforeEach(module('pinzclientApp'));

  // instantiate service
  var Metadataservice;
  beforeEach(inject(function (_Metadataservice_) {
    Metadataservice = _Metadataservice_;
  }));

  it('should return url', function () {
    expect(Metadataservice.getUrl()).toBe("http://localhost:3000/metadata");
  });

  it('should set the url and return it'), function() {
    Metadataservice.setUrl('/metadata');
    expect(Metadataservice.getUrl()).toBe('/metadata');
  }

});
