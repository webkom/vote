import QrScanner from 'qr-scanner';
import QRCode from 'qrcode';
import QrScannerWorkerPath from '!!file-loader!qr-scanner/qr-scanner-worker.min.js';
QrScanner.WORKER_PATH = QrScannerWorkerPath;
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function() {
    const getTokenFromUrl = url => {
      const urlParams = new URLSearchParams(getLocation(url).search);
      return urlParams.get('token');
    };
    const getLocation = function(href) {
      var l = document.createElement('a');
      l.href = href;
      return l;
    };
    const doTokenThing = url => {
      try {
        const [u, p, code] = getTokenFromUrl(url).split(':');
        document.querySelector('[name=password]').value = p;
        document.querySelector('[name=password]').type = 'text';

        document.querySelector('#alertInfo').setAttribute('class', '');

        document.querySelector('[name=usingToken]').value = true;

        document.querySelector('[name=username]').value = u;
        document
          .querySelector('[name=username]')
          .setAttribute('readonly', 'readonly');

        document
          .querySelector('[name=password]')
          .setAttribute('readonly', 'readonly');

        document.querySelector('[type=submit]').style.display = 'none';
        document.querySelector('#testing').style.display = 'none';

        document
          .querySelector('[id=confirmScreenshot]')
          .setAttribute('class', '');
        document.querySelector('[id=confirmScreenshot]').onclick = function(e) {
          e.target.setAttribute('class', 'hidden');
          document.querySelector('[type=submit]').style.display = '';
        };

        fetch('/api/qr/open/?code=' + code);
        QRCode.toDataURL(url, { type: 'image/png', width: 300 }, function(
          err,
          url
        ) {
          document.querySelector('[id=qrImg]').setAttribute('src', url);
        });
      } catch (e) {
        alert('Det skjedde en feil. Prøv på nytt');
        /* eslint no-console: 0 */
        console.warn('Unable to decode token: ', e);
      }
    };
    const token = getTokenFromUrl(window.location.href);
    if (token) {
      doTokenThing(window.location.href);
    } else {
      QrScanner.hasCamera();
      const qrScanner = new QrScanner(
        document.getElementById('testing'),
        result => {
          doTokenThing(result);
        }
      );
      qrScanner.start();
      return;
    }
  });
}
