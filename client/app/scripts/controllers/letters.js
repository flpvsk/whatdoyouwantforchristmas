'use strict';

angular.module('clientApp')
  .controller('LettersCtrl', function (
        $scope, $routeParams, $location, Backend, Fb) {

    analytics.page('User Letter', {
      userId: $routeParams.userId
    });

    Backend.getUser($routeParams.userId)
      .then(function (user) {
        $scope.owner = user;
      });

    $scope.login = function () {
      window._signedUp = true;
      analytics.track('Clicked login button');

      Fb.login(function (response) {

        if (response.authResponse) {
          analytics.track('Logged in');

          $scope.$safeApply(function () {
            $location.path('/friends/' + $routeParams.userId);
            $location.replace();
          });

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
