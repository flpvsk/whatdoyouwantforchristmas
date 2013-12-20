var request = require('request'),
    _ = require('underscore'),
    Q = require('q'),
    log = require('./log'),
    fbUrl = 'https://graph.facebook.com';


module.exports.fetchFriends = function (authData) {
  log.debug('Entering fetch friends', authData.accessToken);
  return Q.nfcall(request, fbUrl + '/me/friends', {
    qs: {
      fields: 'username,name,gender',
      access_token: authData.accessToken
    }
  }).spread(function (response, body) {
    var friends = JSON.parse(body);
    return _.map(friends.data, function (friend) {
      var id = friend.id,
          friend = _.omit(friend, 'id');
      friend.fbId = id;
      return friend;
    });
  }, function (err) {
    log.error('Error fetching', err);
  });
};
