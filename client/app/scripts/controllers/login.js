'use strict';

angular.module('clientApp')
  .controller('LoginCtrl', function ($scope, $location, Fb) {
    analytics.page('Where To Send - Login');

    Fb.runWhenReady(function () { window.FB.XFBML.parse() });
    Fb.getLoginStatus().done(function (data) {
      console.log('In controller', data);

      if (data.status === 'connected') {
        console.log('phase', $scope.$$phase);

        if ($scope.$$phase === '$digest') {
          $location.path('/me');
          $location.replace();
          return;
        }

        $scope.$apply(function () {
          $location.path('/me');
          $location.replace();
        });
      }
    });

  });
