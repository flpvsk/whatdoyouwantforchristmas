var User = require('../models/user'),
    mongoose = require('../lib/mongoose'),
    log = require('../lib/log')(module);

module.exports = function(req, res, next) {
  req.user = res.locals.user = null;
  if (mongoose.readyState !== 1 || !req.session ||!req.session.user) return next();

  User.findById(req.session.user, function(err, user) {
    if (err) return next(err);

    req.user = res.locals.user = user;
    next();
  });
};