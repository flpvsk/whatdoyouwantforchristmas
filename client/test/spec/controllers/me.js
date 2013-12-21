'use strict';

describe('Controller: MeCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var MeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MeCtrl = $controller('MeCtrl', {
      $scope: scope
    });
  }));

});
