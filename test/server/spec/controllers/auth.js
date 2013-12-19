'use strict';

var JsonResponse = require('../../../../server/helpers/json/response'),
    Status = require('../../../../server/helpers/json/status'),
    Response = require('../../mock/response'),
    Request = require('../../mock/request'),
    mongoose = require('mongoose'),
    mockgoose = require('Mockgoose'),
    expect = require('expect.js');

describe('Auth methods', function () {
  after(function () {
    mongoose.connection.db.close();
  });

  before(function () {
    mockgoose(mongoose);
  });

  var auth, req, res, next;
  beforeEach(function () {
    mockgoose.reset();
    auth = require('../../../../server/routes/auth');
    res = new Response();
    req = new Request();
    req.session = new Session();
  });

  var username, password, _id;
  beforeEach(function (done) {
    var User = mongoose.model('User');
    username = 'username';
    password = 'password';
    var user = new User({username: username, password: password});
    user.save(function(err){
      if (err) throw err;
      req.body.username = username;
      req.body.password = password;
      _id = user._id;
      done();
    });
  });

  describe('signIn:', function () {
    it('should successfully authorize new user', function (done) {
      username = 'name';
      req.body.username = username;
      res.setCallback(function () {
        expect(req.session.user).not.to.be.empty();
        expect(res.result.result.username).to.be(username);
        expect(res.result.result._id).not.to.be(_id);
        expect(res.result.result.quotes).to.an('array');
        expect(res.result.result.quotes).to.be.empty();
        expect(res.result.result.hashedPassword).to.be(undefined);
        expect(res.result.result.salt).to.be(undefined);
        expect(res.result.error).to.be.empty();
        expect(res.result.status).to.be(Status.S200);
        done();
      });
      auth.signIn(req, res, next);
    });

    it('should successfully authorize old user', function (done) {
      res.setCallback(function () {
        expect(req.session.user).not.to.be.empty();
        expect(res.result.result.username).to.be(username);
        expect(res.result.result._id).to.eql(_id+'');
        expect(res.result.result.quotes).to.an('array');
        expect(res.result.result.quotes).to.be.empty();
        expect(res.result.result.hashedPassword).to.be(undefined);
        expect(res.result.result.salt).to.be(undefined);
        expect(res.result.error).to.be.empty();
        expect(res.result.status).to.be(Status.S200);
        done();
      });
      auth.signIn(req, res, next);
    });

    it('should respond with ValidationError', function (done) {
      next = function (err) {
        expect(req.session.user).to.be(undefined);
        expect(err.message).to.be('Validation Error');
        expect(err.errors).to.be.an('object');
        expect(err.errors).to.eql({
          password: { message: 'Password is required', path: 'password' },
          username: { message: 'Username is required', path: 'username' }
        });
        expect(err.code).to.be(400);
        done();
      };
      delete req.body.username;
      delete req.body.password;
      auth.signIn(req, res, next);
    });

    it('should respond with AuthError', function (done) {
      next = function (err) {
        expect(req.session.user).to.be(undefined);
        expect(err.message).to.be('Wrong username or password');
        done();
      };
      req.body.password = 'pass';
      auth.signIn(req, res, next);
    });
  });

  describe('signOut:', function () {
    it('should destroy session and return OK', function () {
      auth.signOut(req, res);
      expect(req.session.called).to.be(true);
      expect(res.result.status).to.be(Status.S200);
      expect(Object.keys(res.result.result).length === 0).to.be(true);
      expect(Object.keys(res.result.error).length === 0).to.be(true);
    });
  });
});

function Session() {
  this.called = false;
  this.destroy = function () {
    this.called = true;
  };
}

Session.prototype.name = 'Session';