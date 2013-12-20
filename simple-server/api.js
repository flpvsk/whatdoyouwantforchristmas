var express = require('express'),
    Q = require('q'),
    log = require('./log'),
    _ = require('underscore'),
    db = require('./db'),
    fb = require('./fb'),
    app = express();

module.exports = app;

app.post('/users/signup', function (req, res, next) {
  log.debug('Got new user', req.body);

  var user = _.omit(req.body, 'authData'),
      userRef = {},
      authData = req.body.authData;

  if (!_.has(authData, 'accessToken')) {
    res.status(400);
    res.json({ status: 400, error: 'Valid authData required' });
    return res.end();
  }

  db.insert('users', user).then(
    successCb(req, res, next, 201),
    errorCb(req, res, next)
  ).then(function (user) {
    userRef.user = user;
  }).done();

  fb.fetchFriends(authData).then(function (result) {
    log.debug('Fetched user friends, found %d', result.length);

    var updateHash = {
      $set: {
        fbFriends: result
      }
    };

    return db.updateById('users', userRef.user._id, updateHash);
  }).then(function () {
    log.info('User friends fetched and saved');
  }).done();

});


app.get('/users', function (req, res, next) {
  var fields;

  log.debug('Searching for user', req.query);

  if (req.query.fields) {
    fields = req.query.fields.split(',');
  }

  return db.findOne('users', req.query.query, fields).then(
    successCb(req, res, next),
    errorCb(req, res, next)
  ).done();

});

app.post('/wishes', function (req, res, next) {
  log.debug('Got new user', req.body);
});


function successCb(req, res, next, status) {
  status = status || 200;
  return function (data) {
    res.status(status);
    res.json({ data: data, status: status });
    res.end();
    return data;
  };
}

function errorCb(req, res, next, status) {
  status = status || 500;
  return function (err) {
    res.status(status);
    res.json({ error: err, status: status });
    res.end();
  }
}
