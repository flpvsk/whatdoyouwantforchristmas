'use strict';

angular.module('clientApp')
  .controller('MeCtrl', function ($scope, $location, Fb, LocalStorage) {
    analytics.page('My Letter');

    var firstWish;

    $scope.wishlist = [];

    firstWish = LocalStorage.get('firstWish');

    if (firstWish) {
      $scope.wishlist.push(firstWish);
      LocalStorage.remove('firstWish');
    }

    $scope.removedClass = function (wish) {
      if (wish.$markRemoved) { return 'removed'; }
      return '';
    };

    $scope.isRemoved = function (wish) {
      return !!wish.$markRemoved;
    };

    $scope.triggerRemoved = function (wish) {
      console.log('in trigger removed', wish);
      wish.$markRemoved = !wish.$markRemoved;
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

    $scope.fetchUser();

  });
