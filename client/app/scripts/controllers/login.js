'use strict';

angular.module('clientApp')
  .controller('LoginCtrl', function ($scope, $location, Fb) {
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
    window._analyticsAddCreatedDate = false;

    Fb.getLoginStatus().done(function (data) {
      console.log('In controller', data);

      if (data.status === 'connected') {
        goToMyLetter();
      }

    });

    $scope.login = function () {
      window._analyticsAddCreatedDate = true;

      Fb.login(function (response) {

        if (response.authResponse) {
          goToMyLetter();
        } else {
          $scope.$apply(function () {
            $scope.showError = true;
          });
        }

      }, { scope: 'email' });
    };

  });
