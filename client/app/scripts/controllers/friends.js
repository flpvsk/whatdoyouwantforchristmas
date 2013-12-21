'use strict';

angular.module('clientApp')
  .controller('FriendsCtrl', function ($scope, LocalStorage, Backend) {
    analytics.page('Friends');

    $scope.settings = LocalStorage.get('settings') || {};

    $scope.$loading = true;
    $scope.fetchUser().then(function () {
      return Backend.getFriendsList($scope.user)
        .then(function (friends) {
          console.log('Got friends list', friends);
          $scope.friends = friends;
          $scope.$loading = false;
        });
    });

    /*
    $scope.friends = [{
      name: 'Evgenia Salomatina',
      username: 'eugen.salomatina',
      gender: 'female',
      letter: 'Кастомное письмо. А подарки вот:',
      wishlist: [{
        descr: 'Дешевле только тут - табуреты: табуретки для кухни, недорогой кухонный табурет, складные табуреты, дешевые табуретки  купить можно в нашем интернет-магазине',
        type: 'link',
        address: 'http://www.mebelklad.ru/index.php?categoryID=20'
      }, {
        descr: 'Шампиньоны, нарезанные тонко и вкусно запечёные щи!',
        givers: [{
          name: 'Fipa Solo',
          username: 'fipa.solo'
        }, {
          name: 'Andrey Salomatin',
          username: 'filipovskii.off'
        }]
      }]
    }, {
      name: 'Andrey Pushkarev',
      username: 'fealaer',
      gender: 'male',
      wishlist: [{
        descr: 'Доску для сёрфинга'
      }, {
        descr: 'Путёвку на двоих к океану'
      }, {
        descr: 'Годовой запас еды для Герцога'
      }]
    }, {
      name: 'Ilya Vakhrushev',
      username: 'ilya.vakhrushev.9',
      gender: 'male',
      wishlist: [{
        descr: 'Бесконечно тонкий байк'
      }, {
        descr: 'Вафель'
      }, {
        descr: 'Новую работу'
      }, {
        descr: 'Кофе'
      }]
    }];
    */

    $scope.isLoading = function () {
      return !!$scope.$loading;
    };

    $scope.isGiver = function (wish) {
      if (!wish.givers) { return false; }
      if (!$scope.user) { return false; }
      return _.any(wish.givers, function (giver) {
        return giver.username === $scope.user.username;
      });
    };

    $scope.wantToGive = function (wish, friend) {
      wish.givers = wish.givers || [];
      wish.givers.push($scope.user);

      Backend.addGiver($scope.user, wish);

      analytics.track('Wants to Give', {
        userUsername: $scope.user.username,
        userId: $scope.user.id,
        wishDescr: wish.descr,
        friendUsername: friend.username
      });
    };

    $scope.dontWantToGive = function (wish, friend) {
      wish.givers = _.filter(wish.givers, function (giver) {
        return giver.username !== $scope.user.username;
      });

      Backend.removeGiver($scope.user, wish);

      analytics.track('Does Not Want to Give', {
        userUsername: $scope.user.username,
        userId: $scope.user.id,
        wishDescr: wish.descr,
        friendUsername: friend.username
      });

    };

    $scope.hideIntro = function () {
      $scope.settings.hideFriendsIntro = true;
      LocalStorage.put('settings', $scope.settings);
    };

    $scope.introHidden = function () {
      return !!$scope.settings.hideFriendsIntro;
    };

  });
