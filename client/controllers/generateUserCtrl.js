module.exports = [
  '$scope',
  'userService',
  'alertService',
  function ($scope, userService, alertService) {
    $scope.generateUser = {};

    $scope.generateUser = function (username) {
      userService.generateUser({ username }).then(
        function (response) {
          alertService.addSuccess('Bruker generert!');
          $scope.username = '';
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
