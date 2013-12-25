var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    Q = require('q'),
    _ = require('underscore'),
    log = require('./log'),
    url = (process.env['MONGOLAB_URI'] ||
        'mongodb://localhost/christmas-staging'),
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
  return Q.ninvoke(dbRef.db.collection(col), 'insert', doc, { safe: true })
    .then(function (res) {
      return res[0];
    });
};

module.exports.updateById = function mongoUpdateById(col, id, hash) {
  log.debug('Updating', col, id);
  var dbCol = dbRef.db.collection(col);

  if (_.isString(id)) {
    id = new ObjectID(id);
  }

  return Q.ninvoke(dbCol, 'update', { _id: id }, hash, { safe: true })
    .then(function (res) {
      log.debug('Update result %s', res);
      return res;
    });
};

module.exports.update = function mongoUpdate(col, query, hash) {
  log.debug('Updating', query, hash);
  var dbCol = dbRef.db.collection(col);

  return Q.ninvoke(dbCol, 'update', query, hash, {
    multi: true,
    safe: true
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

module.exports.aggregate = function mongoAggregate(col, pipe) {
  return Q.ninvoke(dbRef.db.collection(col), 'aggregate', pipe);
};

module.exports.createIfNotExist = function (col, query, hash) {
  return Q.ninvoke(dbRef.db.collection(col), 'update', query, hash, {
    'upsert': true
  });
};
