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
              fields: 'name,username,id,fbId,gender,wishlist,letter'
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
          url: '/api/wishes',
          data: wish
        }).then(extractData);
      },

      getFriendsList: function (user) {
        return $http({
          method: 'GET',
          url: '/api/users/' + user._id + '/friends'
        }).then(extractData);
      }
    };
  });
