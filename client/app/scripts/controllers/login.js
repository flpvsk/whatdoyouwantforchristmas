'use strict';

angular.module('clientApp')
  .controller('LoginCtrl', function () {
    FB.getLoginStatus(function () {
      console.log('Got login status', arguments);
    });
  });
