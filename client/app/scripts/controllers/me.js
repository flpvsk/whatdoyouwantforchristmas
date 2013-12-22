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
    $scope.letter = '';

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
      }, 1500);

      Backend.saveWish($scope.user, wish)
        .then(function () {
          console.log('Saved');
        });
    };


    $scope.restoreWish = function (wish, $ev) {
      console.log('Restored a wish');
      analytics.track('Restored a wish');

      $($ev).parents('li').removeClass('fadeOutUp');
      $timeout.cancel(wish.$disapear);

      wish.removed = false;

      Backend.saveWish($scope.user, wish)
        .then(function () {
          console.log('Saved');
        });

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

    $scope.hasLetter = function () {
      $scope.letter = $scope.letter || '';
      return $scope.letter.length || $scope.wishlist.length;
    };

    $scope.cancelEdit = function () {
      $scope.$action = '';
      $scope.newLetter = '';
    };

    $scope.shareLetterOnFb = function () {
      analytics.track('Clicked Share a Letter');

      var url, caption;

      url = (
        'http://www.whatdoyouwantforchristmas.net/#/letters/' +
        $scope.user._id +
        '?utm_source=facebook&utm_medium=invite' +
        '&utm_content=letter&utm_campaign=new%20year'
      );

      caption = 'Дорогой Дедушка Мороз!&nbsp;<center>&nbsp;</center>';

      if ($scope.letter.length) {
        caption += $scope.letter;
      } else {
        caption += $scope.getDefaultLetter($scope.user);
      }

      _.forEach($scope.wishlist, function (wish) {
        caption = (
          caption +
          '<center>&nbsp;</center>&nbsp;&nbsp;*&nbsp;&nbsp;' +
          wish.descr
        );
      });

      FB.ui({
        method: 'feed',
        link: url
      }, function(response) {
        if (response && response.post_id) {
          analytics.track('Shared letter on facebook');
        } else {
          analytics.track('Canceled letter sharing');
        }
      });
    };
  });
