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
            `Bruker generert/oppdatert for ${response.data}!`
          );
          $scope.user = {};
          $scope.pending = false;
        },
        function (response) {
          $scope.pending = false;
          switch (response.data.name) {
            case 'DuplicateLegoUserError':
              alertService.addError(
                'Denne LEGO brukern har allerede fått en bruker.'
              );
              break;
            case 'DuplicateCardError':
              alertService.addError(
                'Dette kortet er allerede blitt registrert.'
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
