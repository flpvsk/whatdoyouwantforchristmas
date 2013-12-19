'use strict';

var JsonResponse = require('../../../../server/helpers/json/response'),
    Status = require('../../../../server/helpers/json/status'),
    Response = require('../../mock/response'),
    Request = require('../../mock/request'),
    expect = require('expect.js');

describe('REST API v0 method', function () {
  var rest, req, res, next;

  beforeEach(function () {
    rest = require('../../../../server/controllers/api/v0/rest')(TestModel);
    res = new Response();
  });

  describe('Get:', function () {
    it('should respond with all test records', function () {
      var records = [1, 2];
      TestModel.find = function (query, callback) {
        callback(null, records);
      };
      rest.query(req, res, next);
      expect(res.result.result).to.be(records);
      expect(res.result.status).to.be(Status.S200);
      expect(Object.keys(res.result.error).length === 0).to.be(true);
    });

    it('should respond with error', function () {
      TestModel.find = function (query, callback) {
        var error = new Error(500, 'Internal server error');
        callback(error, null);
      };
      rest.query(req, res, next);
      expect(Object.keys(res.result.result).length === 0).to.be(true);
      expect(res.result.status).to.be(Status.S500);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Internal server error');
      expect(res.result.error.code).to.be(500);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/500');
    });
  });

  describe('Post:', function () {
    it('should respond with created record and remove _id before save', function () {
      TestModel.prototype.validate = function (callback) {
        callback(null);
      };

      TestModel.prototype.save = function (callback) {
        callback(null);
      };
      var data = {_id: '5260001073657b99d0000001', name: 'test', fake: true};
      req = new Request(data);
      rest.post(req, res, next);
      expect(res.result.result.data.name).to.be('test');
      expect(res.result.result.data.fake).to.be(true);
      expect(res.result.result.data._id).to.be(undefined);
      expect(res.result.status).to.be(Status.S200);
      expect(Object.keys(res.result.error).length === 0).to.be(true);
    });

    it('should respond with save error', function () {
      TestModel.prototype.validate = function (callback) {
        callback(null);
      };
      TestModel.prototype.save = function (callback) {
        callback({message: 'some error'});
      };
      var data = {_id: '5260001073657b99d0000001', name: 'test', fake: true};
      req = new Request(data);
      rest.post(req, res, next);
      expect(res.result.status).to.be(Status.S500);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Internal server error');
      expect(res.result.error.code).to.be(500);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/500');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should respond with validation error', function () {
      TestModel.prototype.validate = function (callback) {
        callback({ message: 'Validation failed',
          name: 'ValidationError',
          errors: {
            username: {
              message: 'Validator "required" failed for path username',
              name: 'ValidatorError',
              path: 'username',
              type: 'required'
            },
            password: {
              message: 'Validator "required" failed for path password',
              name: 'ValidatorError',
              path: 'password',
              type: 'required'
            }
          }
        });
      };
      TestModel.prototype.save = function (callback) {
        callback(null);
      };
      var data = {_id: '5260001073657b99d0000001', name: 'test', fake: true};
      req = new Request(data);
      rest.post(req, res, next);
      expect(res.result.status).to.be(Status.S400);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Validation failed');
      expect(res.result.error.code).to.be(400);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/400');
      expect(res.result.error.errors.length).to.be(2);
      expect(res.result.error.errors[0].path).to.be('username');
      expect(res.result.error.errors[0].message).to.be('Validator "required" failed for path username');
      expect(res.result.error.errors[1].path).to.be('password');
      expect(res.result.error.errors[1].message).to.be('Validator "required" failed for path password');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });
  });

  describe('Get by Id:', function () {
    it('should respond with \'Incorrect record ID\' error', function () {
      var params = {id: 'abba'};
      req = new Request(null, params);
      rest.get(req, res, next);
      expect(res.result.status).to.be(Status.S400);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Incorrect record ID');
      expect(res.result.error.code).to.be(400);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/400');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should respond with DB error', function () {
      TestModel.findById = function (id, callback) {
        callback({message: 'some error'});
      };
      var params = {id: '5260001073657b99d0000001'};
      req = new Request(null, params);
      rest.get(req, res, next);
      expect(res.result.status).to.be(Status.S500);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Internal server error');
      expect(res.result.error.code).to.be(500);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/500');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should respond with \'Record not found\' error', function () {
      TestModel.findById = function (id, callback) {
        callback(null, null);
      };
      var params = {id: '5260001073657b99d0000001'};
      req = new Request(null, params);
      rest.get(req, res, next);
      expect(res.result.status).to.be(Status.S404);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Record not found');
      expect(res.result.error.code).to.be(404);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/404');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should find and return a single document in a collection by its id', function () {
      TestModel.findById = function (id, callback) {
        callback(null, data);
      };
      var data = {_id: '5260001073657b99d0000001', name: 'test', fake: true};
      var params = {id: '5260001073657b99d0000001'};
      req = new Request(null, params);
      rest.get(req, res, next);
      expect(res.result.status).to.be(Status.S200);
      expect(res.result.result).to.be(data);
      expect(Object.keys(res.result.error).length === 0).to.be(true);
    });
  });

  describe('Delete by Id:', function () {
    it('should respond with \'Incorrect record ID\' error', function () {
      var data = {id: 'abba'};
      req = new Request(data);
      rest.delete(req, res, next);
      expect(res.result.status).to.be(Status.S400);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Incorrect record ID');
      expect(res.result.error.code).to.be(400);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/400');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should respond with DB error', function () {
      TestModel.remove = function (id, callback) {
        callback({message: 'some error'});
      };
      var data = {id: '5260001073657b99d0000001'};
      req = new Request(data);
      rest.delete(req, res, next);
      expect(res.result.status).to.be(Status.S500);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Internal server error');
      expect(res.result.error.code).to.be(500);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/500');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should respond with \'Record does not exist\' error', function () {
      TestModel.remove = function (id, callback) {
        callback(null, 0);
      };
      var data = {id: '5260001073657b99d0000001'};
      req = new Request(data);
      rest.delete(req, res, next);
      expect(res.result.status).to.be(Status.S404);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Record does not exist');
      expect(res.result.error.code).to.be(404);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/404');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should remove a single document in a collection and return that only one document affected', function () {
      TestModel.remove = function (id, callback) {
        callback(null, 1);
      };
      var data = {id: '5260001073657b99d0000001'};
      req = new Request(data);
      rest.delete(req, res, next);
      expect(res.result.status).to.be(Status.S200);
      expect(res.result.result).not.to.be(undefined);
      expect(res.result.result.recordsAffected).to.be(1);
      expect(Object.keys(res.result.error).length === 0).to.be(true);
    });
  });

  describe('Put by Id:', function () {
    it('should respond with \'Incorrect record ID\' error', function () {
      var data = {id: 'abba'};
      req = new Request(data);
      rest.put(req, res, next);
      expect(res.result.status).to.be(Status.S400);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Incorrect record ID');
      expect(res.result.error.code).to.be(400);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/400');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should respond with DB error', function () {
      TestModel.update = function (conditions, update, options, callback) {
        callback({message: 'some error'});
      };
      var data = {id: '5260001073657b99d0000001'};
      req = new Request(data);
      rest.put(req, res, next);
      expect(res.result.status).to.be(Status.S500);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Internal server error');
      expect(res.result.error.code).to.be(500);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/500');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should respond with \'Record does not exist\' error', function () {
      TestModel.update = function (conditions, update, options, callback) {
        callback(null, 0);
      };
      var data = {id: '5260001073657b99d0000001'};
      req = new Request(data);
      rest.put(req, res, next);
      expect(res.result.status).to.be(Status.S404);
      expect(res.result.error).not.to.be(undefined);
      expect(res.result.error.message).to.be('Record does not exist');
      expect(res.result.error.code).to.be(404);
      expect(res.result.error.moreInfo).to.be('http://localhost:3000/api/docs/errors/404');
      expect(Object.keys(res.result.result).length === 0).to.be(true);
    });

    it('should update a single document in a collection and return that only one document affected', function () {
      TestModel.update = function (conditions, update, options, callback) {
        expect(Object.keys(conditions._id).length !== 0).to.be(true);
        expect(update.newField).to.be('newField');
        expect(options.upsert).to.be(true);
        callback(null, 1);
      };
      var data = {id: '5260001073657b99d0000001', newField: 'newField'};
      req = new Request(data);
      rest.put(req, res, next);
      expect(res.result.status).to.be(Status.S200);
      expect(res.result.result).not.to.be(undefined);
      expect(res.result.result.recordsAffected).to.be(1);
      expect(Object.keys(res.result.error).length === 0).to.be(true);
    });
  });
});

function TestModel(data) {
  this.data = data;
}

TestModel.prototype.name = 'TestModel';