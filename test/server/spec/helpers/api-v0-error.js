'use strict';

var JsonError = require('../../../../server/helpers/json/error'),
    expect = require('expect.js');

describe('Api Error V0:', function () {

  it('should create new JsonError based on ValidatorError', function () {
    var err =
    { message: 'Validation failed',
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
    };
    var error = new JsonError(err, 404, 'Record not found');
    expect(error.message).to.be('Validation failed');
    expect(error.code).to.be(400);
    expect(error.moreInfo).to.be('http://localhost:3000/api/docs/errors/400');
    expect(error.errors.length).to.be(2);
    expect(error.errors[0].path).to.be('username');
    expect(error.errors[0].message).to.be('Validator "required" failed for path username');
    expect(error.errors[1].path).to.be('password');
    expect(error.errors[1].message).to.be('Validator "required" failed for path password');
  });

  it('should create new JsonError based on MongoError', function () {
    var err =
    { name: 'MongoError',
      message: 'E11000 duplicate key error index: medinfo.users.$UserName_1  dup key: { : "ann" }',
      code: 11000
    };
    var error = new JsonError(err, 404, 'Record not found');
    expect(error.message).to.be('Not unique value \'ann\' for field \'UserName\'');
    expect(error.code).to.be(400);
    expect(error.moreInfo).to.be('http://localhost:3000/api/docs/errors/400');
  });

  it('should create new JsonError based on AuthError', function () {
    var err =
    { name: 'AuthError',
      message: "You aren't authorized",
      status: 401
    };
    var error = new JsonError(err);
    expect(error.message).to.be(err.message);
    expect(error.code).to.be(err.status);
    expect(error.moreInfo).to.be('http://localhost:3000/api/docs/errors/401');
  });

  it('should create new JsonError based on error', function () {
    var error = new JsonError({}, 404, 'Record not found');
    expect(error.message).to.be('Internal server error');
    expect(error.code).to.be(500);
    expect(error.moreInfo).to.be('http://localhost:3000/api/docs/errors/500');
  });

  it('should create new JsonError based on code and message', function () {
    var error = new JsonError(null, 404, 'Record not found');
    expect(error.message).to.be('Record not found');
    expect(error.code).to.be(404);
    expect(error.moreInfo).to.be('http://localhost:3000/api/docs/errors/404');
  });
});