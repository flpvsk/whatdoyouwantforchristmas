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
              fields: 'username,id,fbId,gender'
            }
          }).then(function (res) {
            d.resolve(res.data.data);
          });
        });

        return d.promise();
      },

      addWish: function (user, wish) {
        wish.user_id = user._id;
        return $http({
          method: 'POST',
          url: '/api/wishes',
          data: wish
        }).then(extractData);
      }
    };
  });
