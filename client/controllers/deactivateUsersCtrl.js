const deactivate = new Audio(require('../../public/deactivate.mp3'));

module.exports = [
  '$scope',
  '$route',
  'userService',
  'alertService',
  function($scope, $route, userService, alertService) {
    $scope.deactivateNonAdminUsers = function() {
      userService.deactivateNonAdminUsers().then(
        function(response) {
          deactivate.play();
          alertService.addSuccess('Alle brukere ble deaktivert!');
        },
        function(response) {
          alertService.addError();
        }
      );

      $route.reload();
    };
  }
];
