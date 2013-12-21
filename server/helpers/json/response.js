var apiStatus = require('./status'),
    HttpError = require('../../error').HttpError;

function JsonResponse(error, result) {
  if (!error) {
    this.status = apiStatus.S200;
  } else {
    this.status = apiStatus.statusByCode(error.code);
  }
  if ((!error && !result) || (error && result))
    throw new HttpError(500, 'Internal server error: Illegal arguments for JsonResponse. Server can\'t return valid response.');
  this.result = result || {};
  this.error = error || {};
}

JsonResponse.prototype.name = 'JsonResponse';

module.exports = JsonResponse;