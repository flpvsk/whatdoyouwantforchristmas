var express = require('express'),
    Q = require('q'),
    log = require('./log'),
    _ = require('underscore'),
    db = require('./db'),
    fb = require('./fb'),
    model = require('./model'),
    app = express();

module.exports = app;

app.get('/users', function (req, res, next) {
  var fields, findUser;

  log.debug('Searching for user', req.query);

  if (req.query.fields) {
    fields = req.query.fields.split(',');
  }

  findUser = db.findOne('users', req.query.query, fields)

  if (_.contains(fields, 'wishlist')) {
    findUser = findUser
      .then(function (user) {
        log.debug('User', user);
        return [
          user,
          db.find('wishes', {
            userId: user._id
          }, [
            'type',
            'descr',
            'address'
          ]) ];
      })
      .spread(function (user, wishlist) {
        user.wishlist = wishlist;
        return user;
      });
  }

  return findUser.then(
    successCb(req, res, next),
    errorCb(req, res, next)
  ).done();

});

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



app.post('/wishes', function (req, res, next) {
  return model.wish.parse(req.body)
    .then(function (wish) {
      return db.insert('wishes', wish);
    })
    .then(
      successCb(req, res, next, 201)
      //errorCb(req, res, next)
    )
    .done();

});

app.put('/wishes', function (req, res, next) {
  return model.wish.parse(req.body)
    .then(function (wish) {
      return db.save('wishes', wish);
    })
    .then(
      successCb(req, res, next)
      //errorCb(req, res, next)
    )
    .done();
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
