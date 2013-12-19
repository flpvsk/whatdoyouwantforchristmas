'use strict';

angular.module('clientApp')
  .controller('MeCtrl', function ($scope, $location, Fb) {
    analytics.page('My Letter');

    var images = [
      'bear',
      'bullfinch',
      'deer',
      'dm',
      'penguin',
      'snowman'
    ];

    $scope.getImage = function () {
      var n = Math.floor(Math.random() * 100) % (images.length - 1),
          image = $scope.image;

      if (image && image.length > 0) { return $scope.image; }

      $scope.image = images[n];
      return $scope.image;
    };


    Fb.getUser().then(function (user) {
      $scope.$apply(function () {
        $scope.user = user;
      });
    });

  });
