var ObjectID = require('mongodb').ObjectID,
    JsonError = require('./json/error');

module.exports = function validateObjectId(id, callback) {
  if (id) {
    try {
      var _id = new ObjectID(id);
      callback(null, _id);
    } catch (e) {
      callback(new JsonError(null, 400, 'Incorrect record ID'), null);
    }
  } else {
    callback(new JsonError(null, 400, 'Incorrect record ID'), null);
  }
};