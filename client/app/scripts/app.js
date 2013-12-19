'use strict';

angular.module('clientApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
]).config(function ($routeProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/where-to-send', {
      templateUrl: 'views/where-to-send.html',
      controller: 'LoginCtrl'
    })
    .when('/me', {
      templateUrl: 'views/me.html',
      controller: 'MeCtrl'
    })
    .when('/friends', {
      templateUrl: 'views/friends.html',
      controller: 'FriendsCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });

}).run(function ($rootScope, Fb) {
  var images = [
    'bear',
    'bullfinch',
    'deer',
    'dm',
    'penguin',
    'snowman'
  ];

  $rootScope.getImage = function () {
    var n = Math.floor(Math.random() * 100) % (images.length - 1),
        image = $rootScope.image;

    if (image && image.length > 0) { return $rootScope.image; }

    $rootScope.image = images[n];
    return $rootScope.image;
  };

  $rootScope.fetchUser = function () {
    var d = $.Deferred();

    if ($rootScope.user) {
      setTimeout(function () { d.resolve(); }, 0);
      return d.promise();
    }

    Fb.getUser().then(function (user) {
      $rootScope.$apply(function () {
        $rootScope.user = user;
        d.resolve();
      });
    });

    return d.promise();
  };

});

// Load the SDK asynchronously
(function(d){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/ru_RU/all.js";
 ref.parentNode.insertBefore(js, ref);
}(document));



window.fbAsyncInit = function () {

  function triggerEvent(name) {
    var doc = window.document;
    if ('createEvent' in doc) {
      var e = doc.createEvent('HTMLEvents');
      e.initEvent(name, false, true);
      doc.dispatchEvent(e);
    } else {
      doc.fireEvent(name);
    }
  };

  var FB = window.FB;

  window.fbConnected = false;

  FB.init({
    appId: '558478794247173',
    // check login status
    status: true,
    // enable cookies to allow the server to access the session
    cookie: true,
    // parse XFBML
    xfbml: true
  });

  FB.Event.subscribe('auth.authResponseChange', function (response) {
    // Here we specify what we do with the response anytime this event
    // occurs.
    if (response.status === 'connected') {
      // The response object is returned with a status field that lets the
      // app know the current login status of the person.  In this case,
      // we're handling the situation where they have logged in to the
      // app.

      console.log('FB connected', response);
      window.fbConnected = true;
      triggerEvent('fb-connected');

      analytics.alias(response.authResponse.userID);

      FB.api('/me', function (user) {
        var created = '';
        if (window._analyticsAddCreatedDate) {
          window._analyticsAddCreatedDate = false;
          created = '' + (new Date()).getTime();
          created = created.slice(0, 10);
          created = parseInt(created);
          user.created_at = created;
        }
        analytics.identify(user.id, user);
      });

    } else if (response.status === 'not_authorized') {
      // In this case, the person is logged into Facebook, but not into
      // the app, so we call FB.login() to prompt them to do so.  In
      // real-life usage, you wouldn't want to immediately prompt someone
      // to login like this, for two reasons: (1) JavaScript created popup
      // windows are blocked by most browsers unless they result from
      // direct interaction from people using the app (such as a mouse
      // click) (2) it is a bad experience to be continually prompted to
      // login upon page load.
      FB.login();
    } else {
      // In this case, the person is not logged into Facebook, so we call
      // the login() function to prompt them to do so. Note that at this
      // stage there is no indication of whether they are logged into the
      // app. If they aren't then they'll see the Login dialog right after
      // they log in to Facebook.  The same caveats as above apply to the
      // FB.login() call here.
      FB.login();
    }
  });

  triggerEvent('fb-ready');
  console.log('Ho ho ho, looks like I\'ve connected to FB');

};
