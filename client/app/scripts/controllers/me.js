'use strict';

angular.module('clientApp')
  .controller('MeCtrl', function ($scope, $location, Fb) {
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

    Fb.getLoginStatus().pipe(function (res) {
      if (res.status !== 'connected') {
        $scope.$apply(function () {
          $location.path('/where-to-send');
        });
        return;
      }

      return Fb.getUser();
    }).then(function (user) {
      console.log('Got user');
      $scope.$apply(function () {
        $scope.user = user;
      });
    });

  });
