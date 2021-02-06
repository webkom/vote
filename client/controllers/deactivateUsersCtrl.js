const deactivate = new Audio(require('../../public/deactivate.mp3'));

module.exports = [
  '$scope',
  '$route',
  'userService',
  'registerService',
  'alertService',
  function ($scope, $route, userService, registerService, alertService) {
    $scope.registers = [];
    function getRegisterEntries() {
      registerService.getRegisterEntries().then(
        function (response) {
          $scope.registers = response.data;
        },
        function (response) {
          alertService.addError(response.message);
        }
      );
    }
    getRegisterEntries();

    $scope.deactivateNonAdminUsers = function () {
      userService.deactivateNonAdminUsers().then(
        function (response) {
          deactivate.play();
          alertService.addSuccess('Alle brukere ble deaktivert!');
        },
        function (response) {
          alertService.addError();
        }
      );

      $route.reload();
    };

    $scope.deleteRegister = function (register) {
      if (confirm('Er du sikker på at du vil slette denne brukeren?')) {
        registerService.deleteRegisterEntry(register).then(
          function (response) {
            alertService.addSuccess(response.data.message);
            $route.reload();
          },
          function (response) {
            alertService.addError(response.message);
          }
        );
      }
    };
  },
];
