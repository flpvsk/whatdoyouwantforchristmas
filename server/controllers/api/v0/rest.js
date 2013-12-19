var JsonResponse = require('../../../helpers/json/response'),
    JsonError = require('../../../helpers/json/error'),
    validateObjectId = require('../../../helpers/validateObjectId');

module.exports = function (Model) {
  return new RestApi(Model);
};

function RestApi(_Model) {
  var Model = _Model;

  this.query = function (req, res, next) {
    Model.find({}, function (err, records) {
      if (err) {
        res.json(new JsonResponse(new JsonError(err), null));
      } else {
        res.json(new JsonResponse(null, records));
      }
    });
  };

  this.get = function (req, res, next) {
    validateObjectId(req.params.id, function (err, _id) {
      if (err) {
        res.json(new JsonResponse(err, null));
      } else {
        Model.findById(_id, function (err, record) {
          if (err) {
            res.json(new JsonResponse(new JsonError(err), null));
          } else {
            if (!record) {
              res.json(new JsonResponse(new JsonError(null, 404, 'Record not found'), null));
            } else {
              res.json(new JsonResponse(null, record));
            }
          }
        });
      }
    });
  };

  this.post = function (req, res, next) {
    var rawData = req.body.data || req.body;
    delete rawData._id;
    var newModel = new Model(rawData);
    newModel.validate(function (err) {
      if (err) {
        res.json(new JsonResponse(new JsonError(err), null));
      } else {
        newModel.save(function (err) {
          if (err) {
            res.json(new JsonResponse(new JsonError(err), null));
          } else {
            res.json(new JsonResponse(null, newModel));
          }
        });
      }
    });
  };

  this.put = function (req, res, next) {
    var rawData = req.body.data || req.body;
    validateObjectId(rawData.id, function (err, _id) {
      if (err) {
        res.json(new JsonResponse(err, null));
      } else {
        delete rawData._id;
        delete rawData.id;
        Model.update({'_id': _id}, rawData, {upsert: true}, function (err, affected) {
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
    validateObjectId(rawData.id, function (err, _id) {
      if (err) {
        res.json(new JsonResponse(err, null));
      } else {
        Model.remove({'_id': _id}, function (err, affected) {
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

RestApi.prototype.name = 'RestApi';