var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    Q = require('q'),
    log = require('./log'),
    url = 'mongodb://127.0.0.1:27017/christmas',
    dbRef = {};

Q.ninvoke(mongo, 'connect', url).then(function (db) {
  log.info('Mongo connected');
  dbRef.db = db;
});

module.exports.id = function mongoObjectId(str) {
  return new ObjectID(str);
};

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

module.exports.findOne = function mongoFindOne(col, q, fields) {
  return Q.ninvoke(dbRef.db.collection(col), 'findOne', q, fields);
};

module.exports.find = function mongoFind(col, q, fields) {
  var query = dbRef.db.collection(col).find(q, fields);
  return Q.ninvoke(query, 'toArray');
};

module.exports.save = function mongoSave(col, obj) {
  return Q.ninvoke(dbRef.db.collection(col), 'save', obj);
};

