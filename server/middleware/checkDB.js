var DBError = require('../error').DBError,
    mongoose = require('../lib/mongoose');

// method which checks is DB ready for work or not
module.exports = function(req, res, next) {
  if (mongoose.readyState !== 1) {
    return next(new DBError(500, 'DataBase disconnected'));
  }
  next();
};