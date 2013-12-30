var express = require('express'),
    Q = require('q'),
    log = require('./log'),
    _ = require('underscore'),
    db = require('./db'),
    model = require('./model'),
    analytics = require('analytics-node'),
    app = express();

module.exports = app;

analytics.init({ secret: 'uh8upim5t8' });

app.use('/newsletters/no-givers', function (req, res, next) {
  if (!checkAuth(req, res, next)) { return; }

  res.end();


  return db.find('wishes', {
    'removed': false,
    'givers.1': { '$exists': true }
  })
  .then(function (wishesWithGivers) {
    var idList = _.map(wishesWithGivers, function (w) { return w.userId; });
    idList = _.uniq(idList, false, function (id) { return id.toString(); })

    return db.aggregate('wishes', [{

      '$match': {
        'removed': false,
        'userId': { '$nin': idList }
      }

    }, {

      '$group': {
        '_id': '$userId',
        'wishlist': {
          '$addToSet': {
            '_id': '$_id',
            'descr': '$descr',
            'type': '$type',
            'address': '$address'
          }
        }
      }

    }]);

  })
  .then(function (noGivers) {
    log.log('debug', 'Got noGivers %d wishes', noGivers.length, {});
    return Q.all(_.map(noGivers, function (u) {
      return db.findById('users', u._id).then(function (user) {

        if (!user) {
          log.log('warn', 'User not found %s', u._id.toString(), {});
          return null;
        }

        user.wishlist = u.wishlist;
        return user;
      }, function (err) {

      });
    }));
  })
  .then(function (noGivers) {
    noGivers = _.filter(noGivers, function (n) { return !!n; });

    log.log('debug', 'Got noGivers and wishes %d', noGivers.length, {});


    return Q.all(_.map(noGivers, function (noGiver) {
      var frFbIdList = _.map(noGiver.fbFriends, function (fr) {
        return fr.fbId;
      });

      log.log('debug', 'noGiver has %j friends', frFbIdList.length, {});

      return db.find('users', { 'fbId': { '$in': frFbIdList } })
        .then(function (friends) {
          var data = {};

          data.aboutUser = _.pick(noGiver, '_id', 'name', 'gender');
          data.aboutWishlist = _.map(noGiver.wishlist, function (w) {
            return _.omit(w, 'givers');
          });

          return Q.all(
            _.map(friends, addNotif(data._id, data, 'no-giver'))
          );
        });
    }));
  })
  .then(function () {
    log.debug('Notifications saved, grouping by reciever');

    return db.aggregate('notifs', [
      {
        '$match': { 'sent': false, 'type': 'no-giver' }
      },
      {
        '$group': {
          '_id': '$to',
          'about': {
            '$addToSet': {
              'user': '$aboutUser',
              'wishlist': '$aboutWishlist'
            }
          }
        }
      }
    ]);
  })
  .then(function (grouped) {
    log.log('debug', 'Grouped %d', grouped.length, {});
    _.forEach(grouped, function (group) {
      var subj = '', body = '', friend, lastDigit;

      if (group.about.length === 0) { return; }
      if (group.about.length === 1) {
        friend = group.about[0].user;
        subj += friend.name;
        subj += ' ждёт ';

        if (friend.gender === 'male') {
          body += 'Мне пришло письмо от твоего друга! ';
          body += 'Поможешь найти ему подарок?';
        }
        if (friend.gender == 'female') {
          body += 'Мне пришло письмо от твоей подруги! ';
          body += 'Поможешь найти ей подарок?';
        }
      }

      if (group.about.length === 2) {
        subj += (
          group.about[0].user.name + ' и ' +
          group.about[1].user.name
        );
        subj += ' ждут ';

        body += 'Мне пришли письма от твоих друзей! ';
        body += 'Поможешь найти им подарки?';
      }

      if (group.about.length > 2) {
        lastDigit = group.about.length - 2;
        lastDigit += '';
        lastDigit = lastDigit.slice(-1);

        subj += (
          group.about[0].user.name + ', ' +
          group.about[1].user.name
        );

        subj += ' и ещё ' + (group.about.length - 2);

        if (group.length > 11 && group.length < 15) {
          subj += ' друзей';
        } else {
          if (_.contains([ '2', '3', '4' ], lastDigit)) {
            subj += ' друга';
          } else {
            subj += ' друзей';
          }
        }

        subj += ' ждут ';

        body += 'Мне пришли письма от твоих друзей! ';
        body += 'Поможешь найти им подарки?';
      }

      subj += 'подарков в этот Новый Год!';

      log.log(
        'debug',
        'TO: %s, subj: `%s`, body: `%s`',
        group._id, subj, body, {}
      );

      return;

      analytics.track({
        'userId': group._id.toString(),
        'event': 'Encourage giving',
        'properties': {
          'subj': subj,
          'body': body,
          'about': group.about
        }
      });
    });
  })
  .done();
});



app.use('/newsletters/no-letter', function (req, res, next) {
  if (!checkAuth(req, res, next)) { return; }

  res.end();

  return db.find('users', { 'letter': { '$exists': false }  })
    .then(function (noLetterUsers) {
      return Q.all(_.map(noLetterUsers, function (user) {
        var fbFrIdList = _.map(user.fbFriends, function (f) {
          return f.fbId;
        });
        log.log('debug', 'Searching for friends for %s', user.username, {});
        return db.find('users', {
          'fbId': { '$in': fbFrIdList },
          'letter': { '$exists': true }
        }).then(function (friends) {

          if (!friends.length) { return; }

          var data = _.map(friends, function (friend) {
            return _.pick(friend, 'name', '_id', 'gender', 'letter');
          });

          log.debug('adding notif');
          return addNotif(null, { 'examples': data }, 'no-letter')(user);
        });
      }));
    })
    .then(function () {
      return db.find('notifs', { 'type': 'no-letter', 'sent': false });
    })
    .then(function (notifs) {
      _.forEach(notifs, function (notif) {
        var subj = 'вот что ',
            frStr = '',
            frOverTwo,
            name;

        if (notif.examples.length == 1) {
          name = notif.examples[0].name;
          if (notif.examples[0].gender === 'female') {
            subj += 'твоя подруга ' + name + ' написала ';
          } else {
            subj += 'твой друг ' + name + ' написал ';
          }
        }

        if (notif.examples.length === 2) {
          frStr = _.map(
            notif.examples,
            function (e) { return e.name; }).join(' и ');

          subj += 'твои друзья ' + frStr + ' написали ';
        }


        if (notif.examples.length > 2) {
          frOverTwo = notif.examples.slice(2).length;

          frStr = _.map(
            notif.examples.slice(0, 2),
            function (e) { return e.name; }).join(', ');

          frStr += ' и ещё ';

          if (frOverTwo === 1) {
            frStr += '1 друг ';
          }

          if (_.contains([ 2, 3, 4 ], frOverTwo)) {
            frStr += frOverTwo + ' друга ';
          }

          if (frOverTwo > 4) {
            frStr += frOverTwo + ' друзей ';
          }


          subj += frStr;
          subj += 'написали ';
        }

        subj += 'Деду Морозу!'

        log.log('debug', 'Subj: %s', subj);

        analytics.track({
          'userId': notif.to.toString(),
          'event': 'Encourage writing a letter',
          'properties': {
            'subj': subj,
            'examples': notif.examples
          }
        });

      });
    });

});

app.use('/newsletters/gift-list', function (req, res, next) {
  if (!checkAuth(req, res, next)) { return; }

  res.end();

  return db.aggregate('wishes', [
    { '$match': { 'givers': { '$exists': true }, 'removed': false } },
    {
      '$project': {
        '_id': 1,
        'givers': 1,
        'descr': 1,
        'type': 1,
        'address': 1,
        'userId': 1,
        'allGivers': '$givers'
      }
    },
    { '$unwind': '$givers' },
    {
      '$group': {
        '_id': '$givers._id',
        'wishes': {
          '$addToSet': {
            '_id': '$_id',
            'givers': '$allGivers',
            'descr': '$descr',
            'type': '$type',
            'address': '$address',
            'userId': '$userId'
          }
        }
      }
    }
  ])
  .then(function (groups) {
    log.log('debug', 'Got %d groups', groups.length, {});
    return Q.all(_.map(groups, function (group) {
      return db.findById('users', group._id)
        .then(function (user) {
          group.user = user;
          return group;
        });
    }));
  })
  .then(function (groups) {
    return Q.all(_.map(groups, function (group) {
      return Q.all(_.map(group.wishes, function (wish) {
        var wishId;

        if (!group.user) {
          log.log('warn', 'User not found %s', group._id, {});
          return null;
        }


        log.log('debug', 'Searching for friend with %s', wish.userId, {});
        return db.findById('users', wish.userId)
          .then(function (friend) {
            if (!friend) {
              log.log('warn', 'Friend not found %s', wish.userId, {});
              return;
            }

            wishId = wish._id;
            wish.friend = _.pick(
              friend,
              '_id', 'fbId', 'name', 'gender', 'username');

            log.log(
              'debug',
              'Adding notif to %s for %s\'s gift: %s',
              group.user.username, wish.friend.username, wish.descr, {});

            return addNotif(
              wishId, { wish: wish }, 'gift-list')(group.user);
          });
      }));
    }));
  })
  .then(function () {
    log.debug('Notifications added');
    return db.aggregate('notifs', [
      { '$match': { 'type': 'gift-list', 'sent': false } },
      {
        '$group': {
          '_id': '$to',
          'wishes': {
            '$addToSet': {
              '_id': '$wish._id',
              'friend': '$wish.friend',
              'descr': '$wish.descr',
              'type': '$wish.type',
              'address': '$wish.address',
              'userId': '$wish.userId'
            }
          }
        }
      }
    ]);
  })
  .then(function (groups) {
    log.log('debug', 'Got notifications %d', groups.length, {});
    groups = _.map(groups, function (group) {
      var hash = {};
      group.wishesByFriend = [];

      _.forEach(group.wishes, function (wish) {
        var friendsData = hash[wish.userId] || {};
        hash[wish.userId] = friendsData;

        friendsData.wishes = friendsData.wishes || [];
        friendsData.wishes.push(_.omit(wish, 'friend'));

        friendsData.friend = wish.friend;

      });

      log.log('debug', 'Hash %j', _.keys(hash), {});

      _.chain(hash).keys().forEach(function (key) {
        log.log('debug', 'Key %s data %j', key, hash[key]);
        group.wishesByFriend.push(hash[key]);
      });

      return group;
    });

    _.forEach(groups, function (group) {
      log.log(
          'debug',
          'Going to send to %s data %j',
          group._id,
          group.wishesByFriend, {});

      analytics.track({
        'userId': group._id.toString(),
        'event': 'Gift list update',
        'properties': {
          'wishesByFriend': group.wishesByFriend
        }
      });

    });

  })
  .done();
});

function checkAuth(req, res, next) {
  if (req.query.key !== process.env.MAIL_KEY &&
      process.env.NODE_ENV !== 'DEV') {
    res.status(403);
    res.end();
    return false;
  }
  return true;
}


function addNotif(aboutId, insertData, type) {

  return function (to) {
    log.log(
        'debug',
        'Adding notification to %s about %s type %s',
        to.username,
        aboutId,
        type, {});

    var queryAndHash = {
      to: to._id,
      about: aboutId,
      type: type
    }, insertHash = { 'sent': false };

    if (process.env.NODE_ENV === 'production') {
      analytics.identify({
        userId : to._id.toString(),
        traits : {
          email : to.email,
          name : to.name,
          first_name: to.first_name,
          gender : to.gender
        }
      });
    }

    insertHash = _.extend(insertHash, insertData);

    return db.createIfNotExist('notifs', queryAndHash, {
      '$setOnInsert': insertHash
    });
  };

};

