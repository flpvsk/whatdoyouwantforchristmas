var mongo = require('mongodb').MongoClient,
    Q = require('q'),
    log = require('./log'),
    url = 'mongodb://127.0.0.1:27017/christmas',
    dbRef = {};

Q.ninvoke(mongo, 'connect', url).then(function (db) {
  log.info('Mongo connected');
  dbRef.db = db;
});

module.exports.insert = function mongoInsert(col, doc) {
  log.debug('Inserting into', col);
  return Q.ninvoke(dbRef.db.collection(col), 'insert', doc)
    .then(function (res) {
      return res[0];
    });
};

module.exports.updateById = function mongoUpdateById(col, id, hash) {
  log.debug('Updating', col, id);
  return Q.ninvoke(dbRef.db.collection(col), 'update', { _id: id }, hash)
    .then(function (res) {
      log.debug('Update result %s', res);
      return res;
    });
};
