'use strict';

angular.module('clientApp')
  .controller('LoginCtrl', function ($scope, $location, Fb, Backend) {
    analytics.page('Where To Send - Login');
    window._signedUp = false;

    Fb.getLoginStatus().done(function (data) {
      console.log('In controller', data);

      if (data.status === 'connected') {
        $scope.goToMyLetter();
      }

    });

    $scope.login = function () {
      window._signedUp = true;
      analytics.track('Clicked login button');

      Fb.login(function (response) {

        if (response.authResponse) {
          analytics.track('Logged in');
          $scope.goToMyLetter();
          Backend.signup(response.authResponse);
        } else {
          analytics.track('Got login error');
          $scope.$apply(function () {
            $scope.showError = true;
          });
        }

      }, { scope: 'email' });
    };

  });
