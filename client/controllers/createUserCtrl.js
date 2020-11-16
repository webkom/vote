module.exports = [
  '$scope',
  'userService',
  'alertService',
  'cardKeyService',
  function ($scope, userService, alertService, cardKeyService) {
    $scope.user = {};

    $scope.createUser = function (user) {
      userService.createUser(user).then(
        function (response) {
          alertService.addSuccess('Bruker registrert!');
          $scope.user = {};
        },
        function (response) {
          switch (response.data.name) {
            case 'DuplicateUsernameError':
              alertService.addError('Dette brukernavnet er allerede i bruk.');
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

    cardKeyService.listen(function (cardKey) {
      $scope.user.cardKey = cardKey;
      $scope.$apply();
    });
  },
];
