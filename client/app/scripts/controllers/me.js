'use strict';

angular.module('clientApp')
  .controller('MeCtrl', function (
        $scope, $location, $timeout, Fb, LocalStorage, Backend) {
    analytics.page('My Letter');

    Fb.getLoginStatus().done(function (data) {
      if (data.status !== 'connected') { $scope.goToLogin(); }
    });

    var firstWish;

    $scope.wishlist = [];

    $scope.fetchUser().then(function () {
      $scope.wishlist = _.filter($scope.user.wishlist, function (wish) {
        return !wish.removed;
      });
      $scope.letter = $scope.user.letter;

      firstWish = LocalStorage.get('firstWish');

      if (firstWish) {
        LocalStorage.remove('firstWish');

        Backend.addWish($scope.user, firstWish)
          .then(function (wish) {
            $scope.wishlist.push(wish);
          });
      }
    });


    $scope.removedClass = function (wish) {
      if (wish.removed) { return 'removed'; }
      return '';
    };

    $scope.isRemoved = function (wish) {
      return !!wish.removed;
    };

    $scope.removeWish = function (wish, $ev) {
      console.log('Removed a wish');
      analytics.track('Removed a wish');

      wish.removed = true;
      wish.$hideAction = true;
      $timeout.cancel(wish.$disapear);

      wish.$disapear = $timeout(function () {
        var $li = $($ev.target).parents('li'),
            endEvents = [
              "webkitAnimationEnd",
              "MSAnimationEnd",
              "animationend",
              "oanimationend"
            ];

        console.log('In timeout', $li, $ev.target);
        $li.addClass('fadeOutUp');

        // cross-browser animation end...
        _.forEach(endEvents, function (evName) {
          $li.on(evName, function () {
            console.log('Animation end');
            $li.remove();

            $scope.wishlist = _.filter($scope.wishlist, function (wish) {
              return !wish.removed;
            });
          });
        });
      }, 1000);

      Backend.saveWish($scope.user, wish)
        .then(function () {
          console.log('Saved');
          wish.$hideAction = false;
        });
    };


    $scope.restoreWish = function (wish, $ev) {
      console.log('Restored a wish');
      analytics.track('Restored a wish');

      $($ev).parents('li').removeClass('fadeOutUp');
      $timeout.cancel(wish.$disapear);

      wish.removed = false;
      wish.$hideAction = true;

      Backend.saveWish($scope.user, wish)
        .then(function () {
          console.log('Saved');
          wish.$hideAction = false;
        });

    };

    $scope.showWishAction = function (wish) {
      return !wish.$hideAction;
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
      analytics.track('Added a wish');
      Backend.addWish($scope.user, { descr: $scope.newWish })
        .then(function (wish) {
          $scope.wishlist.push(wish);
          $scope.user.wishlist.push(wish);
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
      analytics.track('Changed a letter');
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
