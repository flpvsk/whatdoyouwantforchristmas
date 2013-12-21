var express = require('express'),
    Q = require('q'),
    log = require('./log'),
    _ = require('underscore'),
    db = require('./db'),
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


app.put('/users/:id/letter', function (req, res, next) {
  var letter = _.pick(req.body, 'letter');
  log.debug('Updating user letter', req.params.id, letter);
  return db.updateById('users', req.params.id, { $set: letter })
    .then(
      successCb(req, res, next),
      errorCb(req, res, next)
    ).done();
});


app.get('/users/:id/friends', function (req, res, next) {
  log.debug('In find friends');
  return db.findById('users', req.params.id)
    .then(function (user) {
      var frIdList = _.map(user.fbFriends, function (friend) {
        return friend.fbId;
      });

      return db.find('users', { fbId: { $in: frIdList } });
    }).then(function (friends) {
      log.debug('found friends, %s', friends.length);
      if (!friends) { return []; }

      return Q.all(_.map(friends, function (friend) {
        log.debug('Searching wishes for', friend._id.toString(), friend);
        return db.find('wishes', { userId: friend._id, removed: false })
          .then(function (wishlist) {
            console.log('Got wishlist', wishlist.length);
            friend.wishlist = wishlist;
            return friend;
          })
      }));
    })
    .then(function (arr) {
      console.log('Filtering friends');
      return _.filter(arr, function (fr) {
        log.debug('filtering', fr);
        return fr.wishlist.length > 0;
      });
    })
    .then(
      successCb(req, res, next),
      errorCb(req, res, next)
    ).done();
});


app.post('/users/signup', function (req, res, next) {
  log.debug('Signup called', req.body);

  var user = _.omit(req.body, 'authData'),
      userRef = {},
      authData = req.body.authData;

  if (!_.has(authData, 'accessToken')) {
    return errorResponse(res, 400, 'Valid authData required');
  }

  db.findOne('users', _.pick(user, 'fbId'))
    .then(function (user) {
      console.log('User exists');
      if (user) {
        return Q.when(user)
          .then(
            successCb(req, res, next),
            errorCb(req, res, next)
          );
      }
      return db.insert('users', user)
        .then(
          successCb(req, res, next, 201),
          errorCb(req, res, next)
        ) // answer client before fbFetch
        .then(model.user.fetchFbFriends(user, authData))
    })
    .done();

});



app.post('/wishes', function (req, res, next) {
  return model.wish.parse(req.body)
    .then(function (wish) {
      return db.insert('wishes', wish);
    })
    .then(
      successCb(req, res, next, 201),
      errorCb(req, res, next)
    )
    .done();

});

app.put('/wishes/:id', function (req, res, next) {
  return model.wish.parse(req.body)
    .then(function (wish) {
      wish.updated = new Date();
      return db.save('wishes', wish);
    })
    .then(
      successCb(req, res, next),
      errorCb(req, res, next)
    )
    .done();
});


app.put('/wishes/:id/givers', function (req, res, next) {
  if (!req.body._id) {
    return errorResponse(res, 400, 'Giver _id required');
  }

  var user = _.pick(req.body, '_id', 'username', 'gender', 'name', 'fbId');
  user._id = db.id(user._id);

  var hash = {
    $addToSet: {
      givers: user
    }
  };

  return db.update('wishes', { _id: db.id(req.params.id) }, hash);
});

app.delete('/wishes/:id/givers/:userId', function (req, res, next) {
  var hash = {
    $pull: { givers: { _id: db.id(req.params.userId) } }
  };
  return db.update('wishes', { _id: db.id(req.params.id) }, hash)
    .then(successCb(req, res, next), errorCb(req, res, next))
    .done();
});



function successCb(req, res, next, status) {
  status = status || 200;
  return function (data) {
    log.debug('In success cb');
    res.status(status);
    res.json({ data: data, status: status });
    res.end();
    return data;
  };
}

function errorCb(req, res, next, status) {
  status = status || 500;
  return function (err) {
    return errorResponse(res, status, err);
  }
}

function errorResponse(res, status, err) {
  status = status || 500;
  res.status(status);
  res.json({ error: err, status: status });
  return res.end();
}
