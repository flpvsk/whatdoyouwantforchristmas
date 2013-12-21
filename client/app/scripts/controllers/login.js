'use strict';

angular.module('clientApp')
  .controller('LoginCtrl', function ($scope, $location, Fb, Backend) {
    function goToMyLetter() {
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

    analytics.page('Where To Send - Login');
    window._signedUp = false;

    Fb.getLoginStatus().done(function (data) {
      console.log('In controller', data);

      if (data.status === 'connected') {
        goToMyLetter();
      }

    });

    $scope.login = function () {
      window._signedUp = true;
      analytics.track('Clicked login button');

      Fb.login(function (response) {

        if (response.authResponse) {
          goToMyLetter();
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
