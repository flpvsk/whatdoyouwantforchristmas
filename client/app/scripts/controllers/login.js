'use strict';

angular.module('clientApp')
  .controller('LoginCtrl', function ($scope, $location, Backend) {
    analytics.page('Where To Send - Login');

    window._analyticsAddCreatedDate = true;

    var user = Backend.getCurrentUser();

    if (user) {
      console.log('User', user);
      $location.path('/me');
      $location.replace();
      return;
    }


    $scope.login = function () {
      Parse.FacebookUtils.logIn('email', {
        success: function (user) {
          if (!user.existed()) {
            console.log('User not existed');
            window._analyticsAddCreatedDate = true;
          }

          $scope.$apply(function () {
            $location.path('/me');
            $location.replace();
            return;
          });
        },

        error: function (err) {
          $scope.$apply(function () {
            $scope.showError = true;
          });
        }
      });
    };

  });
