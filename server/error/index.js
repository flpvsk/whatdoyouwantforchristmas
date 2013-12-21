var path = require('path');
var util = require('util');
var http = require('http');

// Errors for users
function HttpError(status, message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, HttpError);

  this.status = status;
  this.message = message || http.STATUS_CODES[status] || 'Error';
}

function AuthError(status, message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);

  this.message = message;
  this.status = status;
}

function DBError(status, message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, DBError);

  this.message = message;
  this.status = status;
}

function ValidationError() {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, ValidationError);

  this.message = 'Validation Error';
  this.errors = {};
  this.addError = function (path, message) {
    this.errors[path] = {
      message: message,
      path: path
    };
  };
  this.code = 400;
  this.getErrorsSize = function() {
    return Object.keys(this.errors).length;
  }
}

util.inherits(HttpError, Error);
util.inherits(AuthError, HttpError);
util.inherits(DBError, HttpError);
util.inherits(ValidationError, Error);

HttpError.prototype.name = 'HttpError';
AuthError.prototype.name = 'AuthError';
DBError.prototype.name = 'DBError';
ValidationError.prototype.name = 'ValidationError';

module.exports.HttpError = HttpError;
module.exports.AuthError = AuthError;
module.exports.DBError = DBError;
module.exports.ValidationError = ValidationError;