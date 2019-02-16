const cryptoRandomString = require('crypto-random-string');

module.exports = [
  '$scope',
  '$window',
  'userService',
  'alertService',
  'cardKeyService',
  function($scope, $window, userService, alertService, cardKeyService) {
    $scope.user = {};

    $scope.createUser = function(user) {
      return userService.createUser(user).then(
        function(response) {
          $scope.user = {};
        },
        function(response) {
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
          throw response;
        }
      );
    };

    cardKeyService.listen(function(cardKey) {
      $scope.user.cardKey = cardKey;
      $scope.$apply();

      const username = cryptoRandomString(10);
      const password = cryptoRandomString(10);
      const code = cryptoRandomString(10);

      $scope
        .createUser({
          cardKey,
          username: username,
          password: password
        })
        .then(
          () => {
            $window.location.href = `/moderator/showqr/?token=${username}:${password}:${code}`;
          },
          () => {}
        );
    });
  }
];
