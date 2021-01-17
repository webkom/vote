module.exports = [
  '$scope',
  'userService',
  'alertService',
  function ($scope, userService, alertService) {
    $scope.generateUser = function (email) {
      userService.generateUser({ email }).then(
        function (response) {
          alertService.addSuccess('Bruker generert!');
          $scope.email = '';
        },
        function (response) {
          switch (response.data.name) {
            case 'DuplicateUsernameError':
              alertService.addError(
                'Dette ntnu-brukernavnet er allerede registrert.'
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
