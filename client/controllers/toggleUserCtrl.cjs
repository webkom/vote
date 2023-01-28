const ding = new Audio(require('../../public/ding.mp3').default);
const error = new Audio(require('../../public/error.mp3').default);

module.exports = [
  '$scope',
  'userService',
  'alertService',
  'cardKeyService',
  function ($scope, userService, alertService, cardKeyService) {
    var toggleUser = function (cardKey) {
      userService.toggleUser(cardKey).then(
        function (response) {
          const lastAlert = alertService.getLastAlert();
          ding.play();
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
        function (response) {
          error.play();
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
  },
];
