'use strict';

describe('Controller: FriendsCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var FriendsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FriendsCtrl = $controller('FriendsCtrl', {
      $scope: scope
    });
  }));

});