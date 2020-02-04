const QRCode = require('qrcode');

module.exports = [
  '$scope',
  '$window',
  '$location',
  'alertService',
  'userService',
  'socketIOService',
  function(
    $scope,
    $window,
    $location,
    alertService,
    userService,
    socketIOService
  ) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const cardKey = urlParams.get('cardKey');
    const [, , code] = token.split(':');
    const link = `${window.location.origin}/auth/login/?token=${token}`;
    QRCode.toDataURL(link, { type: 'image/png', width: 1000 }, function(
      err,
      url
    ) {
      $scope.qrdata = url;
    });
    socketIOService.listen('qr-opened', function(socketCode) {
      if (socketCode === code) {
        $scope.$apply(() => {
          $location.url('/moderator/qr?status=success');
        });
      }
    });
    $scope.close = function() {
      $location.url('/moderator/qr?status=success');
    };
    $scope.closeAndDeactivate = function() {
      userService.toggleUser(cardKey).then(
        function(response) {
          $location.url('/moderator/qr?status=fail');
        },
        function() {
          $location.url('/moderator/qr?status=success');
        }
      );
    };
  }
];
