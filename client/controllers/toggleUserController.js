module.exports = [
  '$scope',
  'userService',
  'alertService',
  'cardKeyService',
  function($scope, userService, alertService, cardKeyService) {
    var toggleUser = function(cardKey) {
      userService.toggleUser(cardKey).then(
        function(response) {
          const lastAlert = alertService.getLastAlert();
          if (response.data.active) {
            if (lastAlert && lastAlert.type != 'success') {
              alertService.closeAll();
            }
            alertService.addSuccess('Kort aktivert, GÅ INN', true);
          } else {
            if (lastAlert && lastAlert.type != 'warning') {
              alertService.closeAll();
            }
            alertService.addWarning('Kort deaktivert, GÅ UT', true);
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
