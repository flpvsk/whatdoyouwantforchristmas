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

      service.runWhenConnected(onFbReady);

      return d.promise();
    };

    service.runWhenReady = function runWhenReady(fn) {
      if (window.fbReady) {
        fn();
      } else {
        doc.addEventListener('fb-ready', fn);
      }
    };

    service.runWhenConnected = function runWhenConnected(fn) {
      if (!window.fbConnected) {
        doc.addEventListener('fb-connected', fn);
        return;
      }

      fn();
    };

    service.login = function (fn, opts) {
      service.runWhenReady(function () {
        window.FB.login(fn, opts);
      });
    };


    return service;
  });
