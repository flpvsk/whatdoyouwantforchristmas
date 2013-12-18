'use strict';

angular.module('clientApp')
  .service('Fb', function Fb() {

    var doc = window.document
      , service = {};

    service.getLoginStatus = function getLoginStatus() {
      var d = $.Deferred();

      function onFbReady() {
        window.FB.getLoginStatus(function (o) {
          console.log('Got login status', o);
          d.resolve(o);
        });
      };

      service.runWhenReady(onFbReady);

      return d.promise();
    };


    service.getUser = function getUser() {
      var d = $.Deferred();

      function onFbReady() {
        window.FB.api('/me', function (o) {
          console.log('Got user', o);
          d.resolve(o);
        });
      };

      service.runWhenReady(onFbReady);

      return d.promise();
    };

    service.runWhenReady = function runWhenReady(fn) {
      if (_.has(window, 'FB')) {
        fn();
      } else {
        doc.addEventListener('fb-ready', fn);
      }
    };


    return service;
  });
