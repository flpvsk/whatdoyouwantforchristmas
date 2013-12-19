'use strict';

var checkAuth = require('../../../../server/middleware/checkAuth'),
    expect = require('expect.js');

describe('Middleware checkAuth', function () {
  it('should call next without error', function (done) {
    var req = {session: {user: 1}}, res = null, next = function(err) {
      expect(err).to.be(undefined);
      done();
    };
    checkAuth(req, res, next);
  });

  it('should call next with error', function (done) {
    var req = {}, res = null, next = function(err) {
      expect(err).to.be.ok();
      expect(err.name).to.be('AuthError');
      expect(err.message).to.be('You aren\'t authorized');
      expect(err.status).to.be(401);
      done();
    };
    checkAuth(req, res, next);
  });
});