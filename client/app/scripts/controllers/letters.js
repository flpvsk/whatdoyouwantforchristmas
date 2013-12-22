'use strict';

angular.module('clientApp')
  .controller('LettersCtrl', function (
        $scope, $routeParams, $location, Backend, Fb) {

    analytics.page('User Letter', {
      userId: $routeParams.userId
    });

    Fb.getLoginStatus().done(function (data) {
      if (data.status === 'connected') {
        $scope.$safeApply(function () {
          $location.path('/friends/' + $routeParams.userId);
          $location.replace();
        });
      }
    });

    Backend.getUser($routeParams.userId)
      .then(function (user) {
        $scope.owner = user;
      });

  });
