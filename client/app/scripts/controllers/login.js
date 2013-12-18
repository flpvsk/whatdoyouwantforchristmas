'use strict';

angular.module('clientApp')
  .controller('LoginCtrl', function ($scope, $location, Fb) {

    Fb.runWhenReady(function () { window.FB.XFBML.parse() });
    Fb.getLoginStatus().done(function (data) {
      console.log('In controller', data);

      if (data.status === 'connected') {
        $scope.$apply(function () {
          $location.path('/me');
        });
      }
    });

  });
