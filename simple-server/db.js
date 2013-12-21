var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    Q = require('q'),
    _ = require('underscore'),
    log = require('./log'),
    url = (process.env['MONGOLAB_URI'] ||
        'mongodb://localhost/christmas'),
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

  if (_.isString(id)) {
    id = new ObjectID(id);
  }

  return Q.ninvoke(dbRef.db.collection(col), 'update', { _id: id }, hash)
    .then(function (res) {
      log.debug('Update result %s', res);
      return res;
    });
};

module.exports.update = function mongoUpdate(col, query, hash) {
  log.debug('Updating', query, hash);

  return Q.ninvoke(dbRef.db.collection(col), 'update', query, hash, {
    multi: true
  });
};

module.exports.findOne = function mongoFindOne(col, q, fields) {

  if (fields) {
    return Q.ninvoke(dbRef.db.collection(col), 'findOne', q, fields);
  } else {
    return Q.ninvoke(dbRef.db.collection(col), 'findOne', q);
  }
};

module.exports.findById = function mongoFindById(col, id) {
  if (_.isString(id)) { id = new ObjectID(id); }
  return Q.ninvoke(dbRef.db.collection(col), 'findOne', { _id: id });
};

module.exports.find = function mongoFind(col, q, fields) {
  var query;

  if (fields) {
    query = dbRef.db.collection(col).find(q, fields);
  } else {
    query = dbRef.db.collection(col).find(q);
  }

  return Q.ninvoke(query, 'toArray');
};

module.exports.save = function mongoSave(col, obj) {
  return Q.ninvoke(dbRef.db.collection(col), 'save', obj);
};

