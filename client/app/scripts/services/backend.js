'use strict';

angular.module('clientApp')
  .service('Backend', function Backend() {

    function getUser() {
      var d = $.Deferred();

      Parse.FacebookUtils.logIn('email', {
        success: function (user) {
          return d.resolve(user);
        },

        error: function (err) {
          return d.reject(err);
        }
      });

      return d.promise();
    }

    var Wish = Parse.Object.extend("Wish");

    return {
      'addWish': function (wishData) {
        return getUser().pipe(function (user) {
          console.log('Got user', user);
          var wish = new Wish();
          wish.set(wishData);
          wish.set("user", user);
          return wish.save();
        }).then(function (wish) {
          console.log("Wish saved", wish);
          return wish.toJSON();
        });
      }
    };
  });
