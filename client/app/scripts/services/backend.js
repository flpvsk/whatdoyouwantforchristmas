'use strict';

angular.module('clientApp')
  .service('Backend', function Backend(Fb) {
    return {
      signup: function (authData) {
        Fb.getUser().pipe(function (fbUser) {
          fbUser.fbId = fbUser.id;
          fbUser.authData = authData;
          fbUser = _.omit(fbUser, 'id');

          return $.ajax({
            url: '/api/users/signup',
            contentType: 'application/json',
            method: 'POST',
            data: angular.toJson(fbUser)
          });
        }).pipe(function (res) {
          return res.data;
        });
      }
    };
  });
