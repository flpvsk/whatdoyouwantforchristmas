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
  if (req.query.key !== process.env.MAIL_KEY &&
      process.env.NODE_ENV !== 'DEV') {
    res.status(403);
    res.end();
  }
  res.end();


  return db.aggregate('wishes', [{
    '$match': {
      'removed': false
    }
  }, {
    '$unwind': '$givers'
  }, {
    '$group': {
      '_id': '$userId'
  }}])
  .then(function (usersWithGivers) {
    var idList = _.map(usersWithGivers, function (u) { return u._id; });

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

    analytics.identify({
      userId : to._id.toString(),
      traits : {
        email : to.email,
        name : to.name,
        first_name: to.first_name,
        gender : to.gender
      }
    });

    insertHash = _.extend(insertHash, insertData);

    return db.createIfNotExist('notifs', queryAndHash, {
      '$setOnInsert': insertHash
    });
  };

};

