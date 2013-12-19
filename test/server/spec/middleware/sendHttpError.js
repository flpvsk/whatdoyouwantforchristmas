'use strict';

var expect = require('expect.js'),
    Response = require('../../mock/response'),
    Status = require('../../../../server/helpers/json/status'),
    AuthError = require('../../../../server/error').AuthError;

describe('Middleware sendHttpError', function () {
  var res;
  beforeEach(function(done){
    var setSendHttpError = require('../../../../server/middleware/sendHttpError');
    res = new Response();
    setSendHttpError({}, res, function(){done();});
  });

  it('should send error as JsonResponse', function (done) {
    res.sendHttpError(new AuthError(400, 'Wrong username or password'));
    expect(res.result.status).to.be(Status.S400);
    expect(Object.keys(res.result.error).length !== 0).to.be(true);
    expect(res.result.error.message).to.be('Wrong username or password');
    expect(res.result.error.code).to.be(400);
    expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/400');
    expect(Object.keys(res.result.result).length === 0).to.be(true);
    done();
  });
});