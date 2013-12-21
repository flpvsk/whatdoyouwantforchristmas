var JsonResponse = require('../../../helpers/json/response'),
    JsonError = require('../../../helpers/json/error'),
    validateObjectId = require('../../../helpers/validateObjectId');

module.exports = function (Model, path) {
  return new NestedArrayRestApi(Model, path);
};

function NestedArrayRestApi(_Model, _path) {
  var Model = _Model;
  var path = _path;

  this.get = function (req, res, next) {
    validateObjectId(req.params.id, function (err, _id) {
      if (err) {
        res.json(new JsonResponse(err, null));
      } else {
        Model.findById(_id, project(path), function (err, records) {
          if (err) {
            res.json(new JsonResponse(new JsonError(err), null));
          } else {
            res.json(new JsonResponse(null, records));
          }
        });
      }
    });
  };

  this.post = function (req, res, next) {
    var rawData = req.body.data || req.body;
    validateObjectId(req.params.id, function (err, _id) {
      if (err) {
        res.json(new JsonResponse(err, null));
      } else {
        Model.update({'_id': _id}, post(path, rawData[path]), function (err, affected) {
          if (err) {
            res.json(new JsonResponse(new JsonError(err), null));
          } else {
            res.json(new JsonResponse(null, {recordsAffected: affected}));
          }
        });
      }
    });
  };

  this.put = function (req, res, next) {
    var rawData = req.body.data || req.body;
    validateObjectId(req.params.id, function (err, _id) {
      if (err) {
        res.json(new JsonResponse(err, null));
      } else {
        Model.update(select(path, _id, req.params.value), put(path, rawData[path]), function (err, affected) {
          if (err) {
            res.json(new JsonResponse(new JsonError(err), null));
          } else {
            if (affected < 1) {
              res.json(new JsonResponse(new JsonError(null, 404, 'Record does not exist'), null));
            } else {
              res.json(new JsonResponse(null, {recordsAffected: affected}));
            }
          }
        });
      }
    });
  };

  this.delete = function (req, res, next) {
    var rawData = req.body.data || req.body;
    validateObjectId(req.params.id, function (err, _id) {
      if (err) {
        res.json(new JsonResponse(err, null));
      } else {
        Model.update({'_id': _id}, del(path, req.params.value), function (err, affected) {
          if (err) {
            res.json(new JsonResponse(new JsonError(err), null));
          } else {
            if (affected < 1) {
              res.json(new JsonResponse(new JsonError(null, 404, 'Record does not exist'), null));
            } else {
              res.json(new JsonResponse(null, {recordsAffected: affected}));
            }
          }
        });
      }
    });
  };
}

function project(path) {
  var project = {'_id': 0};
  project[path] = 1;
  return project;
}

function select(path, id, oldValue) {
  var select = {'_id': id};
  select[path] = oldValue;
  return select;
}

function post(path, newValue) {
  var update = {'$push': {}};
  update['$push'][path] = newValue;
  return update;
}

function put(path, newValue) {
  var update = {'$set': {}};
  update['$set'][path + '.$'] = newValue;
  return update;
}

function del(path, oldValue) {
  var update = {'$pull': {}};
  update['$pull'][path] = oldValue;
  return update;
}

NestedArrayRestApi.prototype.name = 'NestedArrayRestApi';