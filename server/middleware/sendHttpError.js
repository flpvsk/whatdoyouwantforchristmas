var JsonResponse = require('../helpers/json/response');
var JsonError = require('../helpers/json/error');

module.exports = function(req, res, next) {
  res.sendHttpError = function(error) {
    res.json(new JsonResponse(new JsonError(error), null));
  };
  next();
};