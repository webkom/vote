module.exports = [
  '$scope',
  '$route',
  'registerService',
  'alertService',
  function ($scope, $route, registerService, alertService) {
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
