module.exports = [
  '$scope',
  'userService',
  'alertService',
  function ($scope, userService, alertService) {
    $scope.generateUser = function (user) {
      $scope.user = {};
      $scope.pending = true;
      userService.generateUser(user).then(
        function (response) {
          alertService.addSuccess(
            `Bruker ${response.data.user} ble ${response.data.status}!`
          );
          $scope.user = {};
          $scope.pending = false;
        },
        function (response) {
          $scope.pending = false;
          switch (response.status) {
            case 409:
              alertService.addError(
                'Denne idenfikatoren har allerede fått en bruker.'
              );
              break;
            default:
              alertService.addError();
          }
        }
      );
    };
  },
];
