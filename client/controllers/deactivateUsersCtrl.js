module.exports = [
  '$scope',
  '$route',
  'userService',
  'alertService',
  function($scope, $route, userService, alertService) {
    $scope.deactivateNonAdminUsers = function() {
      userService
        .deactivateNonAdminUsers()
        .success(function(data) {
          alertService.addSuccess('Alle brukere ble deaktivert!');
        })
        .error(function(data) {
          alertService.addError();
        });

      $route.reload();
    };
  }
];
