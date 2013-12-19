'use strict';

var JsonResponse = require('../../../../server/helpers/json/response'),
    Status = require('../../../../server/helpers/json/status'),
    JsonError = require('../../../../server/helpers/json/error'),
    expect = require('expect.js');

describe('Api Response V0:', function () {

  it('should create new JsonResponse with valid result', function () {
    var records = [1, 2];
    var res = new JsonResponse(null, records);
    expect(res.result).to.be(records);
    expect(res.status).to.be(Status.S200);
    expect(Object.keys(res.error).length === 0).to.be(true);
  });

  it('should create new JsonResponse with error and 500 status', function () {
    var res = new JsonResponse(new JsonError(null, 500, 'Internal server error'), null);
    expect(res.status).to.be(Status.S500);
    expect(Object.keys(res.error).length !== 0).to.be(true);
    expect(res.error.message).to.be('Internal server error');
    expect(res.error.code).to.be(500);
    expect(res.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/500');
    expect(Object.keys(res.result).length === 0).to.be(true);
  });

  it('should create new JsonResponse with error and 404 status', function () {
    var res = new JsonResponse(new JsonError(null, 404, 'Record not found'), null);
    expect(res.status).to.be(Status.S404);
    expect(res.error.message).to.be('Record not found');
    expect(res.error.code).to.be(404);
    expect(res.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/404');
    expect(Object.keys(res.result).length === 0).to.be(true);
  });

  it('should throw exception when try to create JsonResponse with error and result simultaneously', function () {
    expect(function(){new JsonResponse(new JsonError(null, 404, 'Record not found'), [1, 2]);})
        .to.throwError('Internal server error: Illegal arguments for JsonResponse. Server can\'t return valid response.');
  });

  it('should throw exception when try to create JsonResponse with out error or result simultaneously', function () {
    expect(function(){new JsonResponse(null, null);})
        .to.throwError('Internal server error: Illegal arguments for JsonResponse. Server can\'t return valid response.');
  });
});