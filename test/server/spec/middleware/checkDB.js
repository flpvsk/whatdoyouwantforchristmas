'use strict';

var checkDB = require('../../../../server/middleware/checkDB'),
    mongoose = require('mongoose'),
    mockgoose = require('Mockgoose'),
    expect = require('expect.js');

describe('Middleware checkDB', function () {
  after(function () {
    mongoose.connection.db.close();
  });

  before(function () {
    mockgoose(mongoose);
  });

  it('should call next without error', function (done) {
    mongoose.readyState = 1;
    var req = {}, res = null, next = function (err) {
      expect(err).to.be(undefined);
      done();
    };
    checkDB(req, res, next);
  });

  it('should call next with error', function (done) {
    mongoose.readyState = 0;
    var req = {}, res = null, next = function (err) {
      expect(err).to.be.ok();
      expect(err.name).to.be('DBError');
      expect(err.message).to.be('DataBase disconnected');
      expect(err.status).to.be(500);
      done();
    };
    checkDB(req, res, next);
  });
});