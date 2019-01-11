module.exports = [
  '$scope',
  'userService',
  'alertService',
  'cardKeyService',
  function($scope, userService, alertService, cardKeyService) {
    var toggleUser = function(cardKey) {
      alertService.closeAll();
      userService.toggleUser(cardKey).then(
        function(response) {
          if (response.data.active) {
            alertService.addSuccess('Bruker har blitt aktivert.');
          } else {
            alertService.addWarning('Bruker har blitt deaktivert.');
          }
        },
        function(response) {
          switch (response.data.name) {
            case 'NotFoundError':
              alertService.addError(
                'Uregistrert kort, vennligst lag en bruker først.'
              );
              break;
            default:
              alertService.addError();
          }
        }
      );
    };

    cardKeyService.listen(toggleUser);
  }
];
