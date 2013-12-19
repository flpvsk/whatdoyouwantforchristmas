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
      return $scope.$action === 'adding a wish';
    }

    $scope.startAdd = function () {
      $scope.$action = 'adding a wish';
    };

    $scope.cancelAdd = function ($ev) {
      $ev.stopPropagation();
      $scope.$action = '';
      $scope.newWish = '';
    };

    $scope.finishAdd = function () {
      $scope.wishlist.push({ descr: $scope.newWish });
      $scope.$action = '';
      $scope.newWish = '';
    };

    $scope.startEdit = function () {
      $scope.$action = 'editing a letter';
    };

    $scope.editingStarted = function () {
      return $scope.$action === 'editing a letter';
    }

    $scope.finishEdit = function () {
      $scope.$action = '';
      $scope.letter = $scope.newLetter;
      $scope.newLetter = '';
    };

    $scope.cancelEdit = function () {
      $scope.$action = '';
      $scope.newLetter = '';
    };

    $scope.fetchUser();
  });
