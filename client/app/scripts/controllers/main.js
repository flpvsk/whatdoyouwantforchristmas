'use strict';

angular
  .module('clientApp')
  .controller('MainCtrl', function ($scope, $location, Fb, LocalStorage) {
    analytics.page('Main Landing');

    Fb.getLoginStatus().done(function (data) {
      if (data.status === 'connected') { $scope.goToMyLetter(); }
    });

    $scope.saveAndContinue = function ($ev) {

      analytics.track('Added first wish', {
        descr: $scope.descr
      });

      LocalStorage.put('firstWish', { descr: $scope.descr });

      $location.path('/where-to-send');
    };
  });
