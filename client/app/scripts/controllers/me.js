'use strict';

angular.module('clientApp')
  .controller('MeCtrl', function (
        $scope, $location, Fb, LocalStorage, Backend) {
    analytics.page('My Letter');
    var firstWish,
        URL_PATTERN = new RegExp(
          '^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

    $scope.wishlist = [];

    $scope.fetchUser().then(function () {
      $scope.wishlist = $scope.user.wishlist;
      $scope.letter = $scope.user.letter;

      firstWish = LocalStorage.get('firstWish');

      if (firstWish) {
        LocalStorage.remove('firstWish');

        Backend.addWish($scope.user, { descr: $scope.newWish })
          .then(function (wish) {
            $scope.wishlist.push(wish);
          });
      }
    });


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

      if (wish.$markRemoved) { wish.removed = true; }

      Backend.saveWish($scope.user, wish);
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
      Backend.addWish($scope.user, { descr: $scope.newWish })
        .then(function (wish) {
          $scope.wishlist.push(wish);
        });

      $scope.$action = '';
      $scope.newWish = '';
    };

    $scope.startEdit = function () {
      $scope.newLetter = $scope.letter;
      $scope.$action = 'editing a letter';
    };

    $scope.editingStarted = function () {
      return $scope.$action === 'editing a letter';
    }

    $scope.finishEdit = function () {
      Backend.saveLetter($scope.user, $scope.newLetter);

      $scope.$action = '';
      $scope.letter = $scope.newLetter;
      $scope.user.letter = $scope.newLetter;
      $scope.newLetter = '';
    };

    $scope.cancelEdit = function () {
      $scope.$action = '';
      $scope.newLetter = '';
    };

    $scope.fetchUser();
  });
