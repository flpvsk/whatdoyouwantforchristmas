var express = require('express'),
    log = require('./log'),
    _ = require('underscore'),
    db = require('./db'),
    app = express();

module.exports = app;

app.post('/users/signup', function (req, res, next) {
  log.debug('Got new user', req.body);

  var user = _.omit(req.body, 'authData'),
      authData = _.pick(req.body, 'authData');

  db.insert('users', user).then(
    successCb(req, res, next, 201),
    errorCb(req, res, next)
  ).done();
});


function successCb(req, res, next, status) {
  status = status || 200;
  return function (data) {
    res.status(status);
    res.json({ data: data, status: status });
    res.end();
  };
}

function errorCb(req, res, next, status) {
  status = status || 500;
  return function (err) {
    res.status(status);
    res.json({ error: err, status: status });
    next();
  }
}
