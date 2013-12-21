'use strict';

describe('Service: Fb', function () {

  // load the service's module
  beforeEach(module('clientApp'));

  // instantiate service
  var Fb;
  beforeEach(inject(function (_Fb_) {
    Fb = _Fb_;
  }));

  it('should do something', function () {
    expect(!!Fb).toBe(true);
  });

});
