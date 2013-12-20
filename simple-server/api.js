var express = require('express'),
    log = require('./log'),
    _ = require('underscore'),
    app = express();

module.exports = app;

app.post('/users/signup', function (req, res, next) {
  log.debug('Got new user', req.body);
  var user = _.omit(req.body, 'authData'),
      authData = _.pick(req.body, 'authData');

  console.log('got user', user, authData);
  res.json(user);
  /*
  db.insert('users', user).then(function (user) {
    res.json(user);
    res.end();
  });
  */

  // call fb
});
