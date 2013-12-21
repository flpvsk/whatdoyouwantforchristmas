'use strict';

angular.module('clientApp')
  .service('Backend', function Backend(Fb, $http) {

    function extractData(res) {
      console.log('Extracting', res.data);
      return res.data.data;
    }

    return {
      signup: function (authData) {
        Fb.getUser().pipe(function (fbUser) {
          fbUser.fbId = fbUser.id;
          fbUser.authData = authData;
          fbUser = _.omit(fbUser, 'id');

          return $http({
            url: '/api/users/signup',
            method: 'POST',
            data: angular.toJson(fbUser)
          });
        }).pipe(extractData);
      },

      getCurrentUser: function () {
        var d = $.Deferred();
        Fb.getUser().pipe(function (fbUser) {
          $http({
            url: '/api/users',
            method: 'GET',
            params: {
              "query[fbId]": fbUser.id,
              fields: (
                'name,first_name,last_name,username,id,email,' +
                'letter,fbId,gender,wishlist'
              )
            }
          }).then(function (res) {
            d.resolve(res.data.data);
          });
        });

        return d.promise();
      },

      addWish: function (user, wish) {
        wish.userId = user._id;

        return $http({
          method: 'POST',
          url: '/api/wishes',
          data: wish
        }).then(extractData);
      },

      saveWish: function (user, wish) {
        return $http({
          method: 'PUT',
          url: '/api/wishes/' + wish._id,
          data: wish
        }).then(extractData);
      },

      saveLetter: function (user, letter) {
        return $http({
          method: 'PUT',
          url: '/api/users/' + user._id + '/letter',
          data: { letter: letter }
        }).then(extractData);
      },

      getFriendsList: function (user) {
        return $http({
          method: 'GET',
          url: '/api/users/' + user._id + '/friends'
        }).then(extractData);
      },

      addGiver: function (user, wish) {
        return $http({
          method: 'PUT',
          url: '/api/wishes/' + wish._id + '/givers',
          data: _.pick(
            user,
            '_id', 'fbId', 'username', 'name', 'gender'
          )}).then(extractData);
      },

      removeGiver: function (user, wish) {
        console.log('Removing giver', _.pick(user, '_id'));
        return $http({
          method: 'DELETE',
          url: '/api/wishes/' + wish._id + '/givers/' + user._id
        }).then(extractData);
      }
    };
  });
