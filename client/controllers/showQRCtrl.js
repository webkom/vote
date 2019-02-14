const QRCode = require('qrcode');

module.exports = [
  '$scope',
  '$window',
  function($scope, $window) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const link = `https://vote.abakus.no/auth/login/?token=${token}`;
    QRCode.toDataURL(link, { type: 'image/png', width: 1000 }, function(
      err,
      url
    ) {
      $scope.qrdata = url;
    });
    // function redirect() {
    //   $window.location.href = '/moderator/qr';
    // }
    // socketIOService.listen('election', redirect);
  }
];
