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

    $scope.wishlist = [
      { descr: 'Матрас' },
      { descr: 'Жвачка' },
      { descr: 'Хобот' }
    ];

    $scope.removedClass = function (wish) {
      if (wish.$markRemoved) { return 'removed'; }
      return '';
    };

    $scope.triggerRemoved = function (wish) {
      console.log('in trigger removed', wish);
      wish.$markRemoved = !wish.$markRemoved;
    };

    $scope.getImage = function () {
      var n = Math.floor(Math.random() * 100) % (images.length - 1),
          image = $scope.image;

      if (image && image.length > 0) { return $scope.image; }

      $scope.image = images[n];
      return $scope.image;
    };

    $scope.addingStarted = function () {
      return $scope.$adding;
    }

    $scope.startAdd = function () {
      $scope.$adding = true;
    };

    $scope.cancelAdd = function ($ev) {
      $ev.stopPropagation();
      $scope.$adding = false;
      $scope.newWish = '';
    };

    $scope.finishAdd = function () {
      $scope.wishlist.push({ descr: $scope.newWish });
      $scope.$adding = false;
      $scope.newWish = '';
    };


    Fb.getUser().then(function (user) {
      $scope.$apply(function () {
        $scope.user = user;
      });
    });

  });
