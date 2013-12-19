var log = require('../../lib/log')(module);
var util = require('util');
var HOSTNAME = process.env.NODE_HOSTNAME || 'localhost:3000';

function JsonError(err, code, message) {
  if (err) {
    if (err.name === 'ValidationError') {
      this.message = err.message;
      this.code = 400;
      this.errors = [];
      for (var errName in err.errors) {
        this.errors.push({
          path: err.errors[errName].path,
          message: err.errors[errName].message});
      }
    } else if (err.name === 'MongoError' && err.code === 11000) {
      this.message = extractFieldNameAndValue(err.message);
      this.code = 400;
    } else if (err.name === 'AuthError') {
      this.message = err.message;
      this.code = err.status;
    } else {
      log.error(err.stack);
      this.message = 'Internal server error';
      this.code = 500;
    }
  } else {
    this.message = message;
    this.code = code;
  }
  log.warn(this.message);
  this.moreInfo = util.format('http://%s/api/docs/errors/%d', HOSTNAME, this.code);
}

JsonError.prototype.name = 'JsonError';

module.exports = JsonError;

function extractFieldNameAndValue(msg) {
  var start = msg.indexOf('.$') + 2;
  var end = msg.indexOf('_', start);
  var dupKey = msg.indexOf('dup key:', end);
  var startValue = msg.indexOf('"', dupKey) + 1;
  var endValue = msg.indexOf('"', startValue);

  var field = msg.substr(start, end - start);
  var value = msg.substr(startValue, endValue - startValue);

  return util.format('Not unique value \'%s\' for field \'%s\'', value, field);
}