module.exports = [
  '$scope',
  'userService',
  'alertService',
  function ($scope, userService, alertService) {
    $scope.generateUser = function (email) {
      $scope.pending = true;
      userService.generateUser({ email }).then(
        function (response) {
          alertService.addSuccess(
            `Bruker laget for ${response.data} generert!`
          );
          $scope.email = '';
          $scope.pending = false;
        },
        function (response) {
          $scope.pending = false;
          switch (response.data.name) {
            case 'DuplicateEmailError':
              alertService.addError(
                'Denne eposten har allerede fått en bruker.'
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
