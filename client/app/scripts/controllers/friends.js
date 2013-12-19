'use strict';

angular.module('clientApp')
  .controller('FriendsCtrl', function ($scope, LocalStorage) {
    analytics.page('Friends');

    $scope.settings = LocalStorage.get('settings') || {};
    console.log('Settings', $scope.settings);
    $scope.fetchUser();

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

    $scope.isLoading = function () {
      return false;
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
