module.exports = [
  '$scope',
  'userService',
  'alertService',
  'cardKeyService',
  function($scope, userService, alertService, cardKeyService) {
    var toggleUser = function(cardKey) {
      alertService.closeAll();
      userService
        .toggleUser(cardKey)
        .success(function(data) {
          if (data.active) {
            alertService.addSuccess('Bruker har blitt aktivert.');
          } else {
            alertService.addWarning('Bruker har blitt deaktivert.');
          }
        })
        .error(function(error) {
          switch (error.name) {
            case 'NotFoundError':
              alertService.addError(
                'Uregistrert kort, vennligst lag en bruker først.'
              );
              break;
            default:
              alertService.addError();
          }
        });
    };

    cardKeyService.listen(toggleUser);
  }
];
