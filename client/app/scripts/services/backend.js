'use strict';

angular.module('clientApp')
  .service('Backend', function Backend(Fb) {
    return {
      signup: function (authData) {
        Fb.getUser().pipe(function (fbUser) {
          fbUser.authData = authData;

          $.ajax({
            url: '/api/users/signup',
            contentType: 'application/json',
            method: 'POST',
            data: angular.toJson(fbUser)
          });
        });
      }
    };
  });
