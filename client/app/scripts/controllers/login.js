'use strict';

angular.module('clientApp')
  .controller('LoginCtrl', function ($rootScope) {

    var doc = window.document;

    if (_.has(window, 'FB')) {
      onFbReady();
    } else {
      doc.addEventListener('fb-ready', onFbReady);
    }

    function onFbReady() {
      FB.XFBML.parse();

      window.FB.getLoginStatus(function () {
        console.log('Got login status', arguments);
      });
    }

  });
