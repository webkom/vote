import QrScanner from 'qr-scanner';
import QrScannerWorkerPath from '!!file-loader!qr-scanner/qr-scanner-worker.min.js';
QrScanner.WORKER_PATH = QrScannerWorkerPath;
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (!token) {
      QrScanner.hasCamera();
      const qrScanner = new QrScanner(
        document.getElementById('testing'),
        result => {
          window.location = result;
        }
      );
      qrScanner.start();
      console.log('dRunning');
      return;
    }

    try {
      const [u, p, code] = token.split(':');
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
    } catch (e) {
      /* eslint no-console: 0 */
      console.warn('Unable to decode token: ', e);
    }
  });
}
