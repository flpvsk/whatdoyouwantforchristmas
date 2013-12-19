'use strict';

angular.module('clientApp')
  .controller('FriendsCtrl', function ($scope) {
    $scope.fetchUser();

    $scope.friends = [{
      name: 'Evgenia Salomatina',
      username: 'eugen.salomatina',
      wishlist: [{
        descr: 'Табурет'
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

    $scope.wantToGive = function (wish) {
      wish.givers = wish.givers || [];
      wish.givers.push($scope.user);
    };

    $scope.dontWantToGive = function (wish) {
      wish.givers = _.filter(wish.givers, function (giver) {
        return giver.username !== $scope.user.username;
      });
    };

  });
