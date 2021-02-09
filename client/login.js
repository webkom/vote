import QrScanner from 'qr-scanner';
import QRCode from 'qrcode';
import QrScannerWorkerPath from '!!file-loader!qr-scanner/qr-scanner-worker.min.js';
QrScanner.WORKER_PATH = QrScannerWorkerPath;
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function () {
    // Get the token string form the url, on the format username:password:code
    const getTokenFromUrl = (url) => {
      const urlParams = new URLSearchParams(getLocation(url).search);
      return urlParams.get('token');
    };

    // Helper function
    const getLocation = function (href) {
      var l = document.createElement('a');
      l.href = href;
      return l;
    };

    // Parse and insert values from token
    const parseAndUseToken = (url) => {
      try {
        const [u, p, code] = getTokenFromUrl(url).split(':');
        document.querySelector('[name=username]').value = u;
        document.querySelector('[name=username]').style.textAlign = 'center';

        document.querySelector('[name=password]').value = p;
        document.querySelector('[name=password]').type = 'text';
        document.querySelector('[name=password]').style.textAlign = 'center';

        document
          .querySelector('[name=username]')
          .setAttribute('readonly', 'readonly');

        document
          .querySelector('[name=password]')
          .setAttribute('readonly', 'readonly');

        // If the user gets token from mail the code will be ""
        if (code) {
          document.querySelector('#alertInfo').setAttribute('class', '');
          document.querySelector('[name=usingToken]').value = true;
          document.querySelector('[type=submit]').style.display = 'none';
          document.querySelector('#testing').style.display = 'none';

          document
            .querySelector('[id=confirmScreenshot]')
            .setAttribute('class', '');
          document.querySelector('[id=confirmScreenshot]').onclick = function (
            e
          ) {
            e.target.setAttribute('class', 'hidden');
            document.querySelector('[type=submit]').style.display = '';
          };

          fetch('/api/qr/open/?code=' + code);
          QRCode.toDataURL(url, { type: 'image/png', width: 300 }, function (
            err,
            url
          ) {
            document.querySelector('[id=qrImg]').setAttribute('src', url);
          });
        }
      } catch (e) {
        alert('Det skjedde en feil. Prøv på nytt');
        /* eslint no-console: 0 */
        console.warn('Unable to decode token: ', e);
      }
    };

    // Get token
    const token = getTokenFromUrl(window.location.href);
    if (token) {
      parseAndUseToken(window.location.href);
    } else {
      QrScanner.hasCamera();
      const qrScanner = new QrScanner(
        document.getElementById('testing'),
        (result) => {
          parseAndUseToken(result);
        }
      );
      qrScanner.start();
      return;
    }
  });
}
