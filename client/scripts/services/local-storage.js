'use strict';

angular.module('clientApp')
  .service('LocalStorage', function LocalStorage() {

    var ls = window.localStorage;

    return {

      put: function (key, obj) {
        console.log('in put', key, obj);
        ls[key] = angular.toJson(obj);
      },

      get: function (key) {
        return angular.fromJson(ls[key]);
      },

      remove: function (key) {
        delete ls[key];
      }
    };
  });
