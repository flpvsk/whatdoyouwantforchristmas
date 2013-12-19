'use strict';

angular.module('clientApp')
  .service('Backend', function Backend() {

    var Wish = Parse.Object.extend("Wish");

    return {
      addWish: function (wishData) {
        var user = Parse.User.current(),
            wish = new Wish();

        wish.set(wishData);
        wish.set('user', user);
        return wish.save().then(function () {
          console.log('Wish saved', wish);
        });
      },

      getCurrentUser: function () {
        return Parse.User.current();
      }
    };
  });
