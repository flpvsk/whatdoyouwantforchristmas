var AuthError = require('../error').AuthError,
    JsonResponse = require('../helpers/json/response');

module.exports = function(req, res, next) {
  if (!req.session || !req.session.user) {
    return next(new AuthError(401, 'You aren\'t authorized'));
  }
  next();
};