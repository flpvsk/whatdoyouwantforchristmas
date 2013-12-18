'use strict';

angular.module('clientApp')
  .controller('MeCtrl', function ($scope) {
    var images = [
      'bear',
      'bullfinch',
      'deer',
      'dm',
      'penguin',
      'snowman' ];
    $scope.getImage = function () {
      var n = Math.floor(Math.random() * 100) % (images.length - 1);
      return images[n];
    };
  });
