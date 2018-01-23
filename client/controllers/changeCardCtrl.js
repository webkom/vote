module.exports = [
  '$scope',
  'userService',
  'alertService',
  'cardKeyService',
  function($scope, userService, alertService, cardKeyService) {
    $scope.user = {};

    $scope.changeCard = function(user) {
      userService
        .changeCard(user)
        .success(function(data) {
          alertService.addSuccess('Det nye kortet er nå registert.');
          $scope.user = {};
        })
        .error(function(error) {
          switch (error.name) {
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
        });
    };

    cardKeyService.listen(function(cardKey) {
      $scope.user.cardKey = cardKey;
      $scope.$apply();
    });
  }
];
