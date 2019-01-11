module.exports = [
  '$scope',
  'userService',
  'alertService',
  'cardKeyService',
  function($scope, userService, alertService, cardKeyService) {
    $scope.user = {};

    $scope.changeCard = function(user) {
      userService.changeCard(user).then(
        function(response) {
          alertService.addSuccess('Det nye kortet er nå registert.');
          $scope.user = {};
        },
        function(response) {
          switch (response.data.name) {
            case 'DuplicateCardError':
              alertService.addError(
                'Dette kortet er allerede blitt registrert.'
              );
              break;
            case 'InvalidRegistrationError':
              alertService.addError('Ugyldig brukernavn og/eller passord.');
              break;
            default:
              alertService.addError();
          }
        }
      );
    };

    cardKeyService.listen(function(cardKey) {
      $scope.user.cardKey = cardKey;
      $scope.$apply();
    });
  }
];
