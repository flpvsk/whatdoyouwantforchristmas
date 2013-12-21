'use strict';

angular
  .module('clientApp')
  .controller('MainCtrl', function ($scope, $location, LocalStorage) {
    analytics.page('Main Landing');

    $scope.saveAndContinue = function ($ev) {

      analytics.track('Added a Wish', {
        descr: $scope.descr
      });

      LocalStorage.put('firstWish', { descr: $scope.descr });

      $location.path('/where-to-send');
    };
  });
