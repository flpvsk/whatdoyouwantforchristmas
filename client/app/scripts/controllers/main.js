'use strict';

angular
  .module('clientApp')
  .controller('MainCtrl', function ($scope, $location) {
    $scope.saveAndContinue = function ($ev) {
      console.log('Saving');
      $location.path('/where-to-send');
    };
  });
