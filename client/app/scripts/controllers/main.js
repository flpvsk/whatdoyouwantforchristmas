'use strict';

angular
  .module('clientApp')
  .controller('MainCtrl', function ($scope, $location) {
    analytics.page('Main Landing');

    $scope.saveAndContinue = function ($ev) {

      analytics.track('Added a Wish', {
        descr: $scope.descr
      });

      $location.path('/where-to-send');
    };
  });
