const QRCode = require('qrcode');

module.exports = [
  '$scope',
  '$window',
  'socketIOService',
  function($scope, $window, socketIOService) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const [, , code] = token.split(':');
    // TODO make this an ENV_VAR
    const link = `${window.location.origin}/auth/login/?token=${token}`;
    QRCode.toDataURL(link, { type: 'image/png', width: 1000 }, function(
      err,
      url
    ) {
      $scope.qrdata = url;
    });
    socketIOService.listen('qr-opened', function(socketCode) {
      if (socketCode === code) {
        $window.location.href = '/moderator/qr';
      }
    });
  }
];
