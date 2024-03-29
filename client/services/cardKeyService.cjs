const checksum = (data) =>
  data.reduce((previousValue, currentValue) => previousValue ^ currentValue);

const createMessage = (command, data) => {
  const payload = [data.length + 1, command, ...data];
  payload.push(checksum(payload));

  return new Uint8Array([0xaa, 0x00, ...payload, 0xbb]).buffer;
};

const convertUID = (data) => {
  const reversed = data
    .join('')
    .match(/.{1,2}/g)
    .reverse()
    .join('');
  return parseInt(reversed, 16);
};

const validate = (data, receivedChecksum) => {
  const dataDecimal = data.map((item) => parseInt(item, 16));
  const calculatedChecksum = checksum(dataDecimal);
  return Math.abs(calculatedChecksum % 255) === parseInt(receivedChecksum, 16);
};

// prettier-ignore
const replies = {
  '00': 'OK',
  '01': 'ERROR',
  '83': 'NO CARD',
  '87': 'UNKNOWN INTERNAL ERROR',
  '85': 'UNKNOWN COMMAND',
  '84': 'RESPONSE ERROR',
  '82': 'READER TIMEOUT',
  '90': 'CARD DOES NOT SUPPORT THIS COMMAND',
  '8f': 'UNSUPPORTED CARD IN NFC WRITE MODE',
};

const readCardCommand = createMessage(0x25, [0x26, 0x00]);

const parseData = (response) => {
  const hexValues = [];
  for (let i = 0; i < response.length; i += 1) {
    hexValues.push((response[i] < 16 ? '0' : '') + response[i].toString(16));
  }
  const stationId = hexValues[1];
  const length = hexValues[2];
  const status = hexValues[3];
  const flag = hexValues[4];
  const data = hexValues.slice(5, hexValues.length - 1);
  const checksum = hexValues[hexValues.length - 1];
  const valid = validate([stationId, length, status, flag, ...data], checksum);
  return {
    valid: valid,
    status: replies[status],
    data: valid && replies[status] === 'OK' ? convertUID(data) : data,
  };
};

module.exports = [
  '$window',
  '$location',
  '$rootScope',
  '$timeout',
  'alertService',
  function ($window, $location, $rootScope, $timeout, alertService) {
    $rootScope.$on('$routeChangeStart', function () {
      alertService.closeAll();
      angular.element($window).unbind('message');
      clearTimeout($rootScope.serialTimeout);
    });

    // Very simple lock to indicate whether the serial device is ready or is currently busy
    // with a read() operation
    $rootScope.readerBusy = false;

    return {
      listen: async function (cb) {
        // Listen to window messages for test compatability.
        angular.element($window).bind('message', function (e) {
          cb(e.data);
        });
        if ($window.location.href.includes('dummyReader')) {
          $rootScope.dummyReader = true;
          $window.scanCard = (cardKey) =>
            $window.window.postMessage(cardKey, '*');

          $window.console.error(`VOTE DUMMY READER MODE

You are now in dummy reader mode of VOTE. Use the global function "scanCard" to scan a card. The function takes the card UID as the first (and only) parameter, and the UID can be both a string or a number.

Usage: scanCard(123) // where 123 is the cardId `);
        }
        // Open serial connections if they are not already open
        if (
          !$rootScope.serialDevice &&
          !$rootScope.ndef &&
          !$rootScope.dummyReader
        ) {
          try {
            if (
              $window.navigator.userAgent.includes('Android') &&
              $window.NDEFReader &&
              (!$window.navigator.serial ||
                $window.confirm(
                  'You are using an Android device that (might) support web nfc. Click OK to use web nfc, and cancel to fallback to using a usb serial device.'
                ))
            ) {
              const ndef = new $window.NDEFReader();
              await ndef.scan();
              $rootScope.ndef = ndef;
            } else {
              const port = await $window.navigator.serial.requestPort({});
              await port.open({ baudRate: 9600 });
              $rootScope.serialDevice = {
                writer: port.writable.getWriter(),
                reader: port.readable.getReader(),
              };
            }
          } catch (e) {
            $timeout(() => {
              $location.path('/moderator/serial_error');
              console.error(e);
            });
          }
        }
        if ($rootScope.ndef) {
          $rootScope.ndef.onreading = ({ message, serialNumber }) => {
            const data = convertUID(serialNumber.split(':'));
            cb(data);
          };
        } else if ($rootScope.serialDevice) {
          let lastTime = 0;
          let lastData = 0;
          const onComplete = (input) => {
            const { valid, status, data } = parseData(input);
            if (valid && status == 'OK') {
              // Debounce
              if (data !== lastData || Date.now() - lastTime > 2000) {
                // data = card id
                cb(data);
                lastTime = Date.now();
                lastData = data;
              }
            }
          };
          const readResult = async () => {
            const message = [];
            let finished = false;
            // Keep reading bytes until the "end" byte is sent
            // The "end" byte is 0xbb
            while (!finished) {
              // Stop the read if the device is busy somewhere else
              if ($rootScope.readerBusy) break;
              $rootScope.readerBusy = true;
              const { value } = await $rootScope.serialDevice.reader.read();
              $rootScope.readerBusy = false;
              for (let i = 0; i < value.length; i++) {
                // First byte in a message should be 170, otherwise ignore and keep on going
                if (message.length === 0 && value[i] !== 170) {
                  continue;
                }
                // Second byte in a message should be 255, otherwise discard and keep on going
                if (message.length === 1 && value[i] !== 255) {
                  // If value is 170, treat it as the first value, and keep on. Otherwise discard
                  if (value[i] !== 170) {
                    message.length = 0;
                  }
                  continue;
                }

                if (message.length > 3 && message.length >= message[2] + 4) {
                  finished = true;
                  break;
                }
                message.push(value[i]);
              }
            }
            onComplete(message);
          };

          // Constantly send the readCardCommand and read the result.
          // If there is no card, the result will be an error status,
          // which is handled in the onComplete function
          const runPoll = async () => {
            try {
              $rootScope.serialDevice.writer.write(readCardCommand);
              await readResult();
            } catch (e) {
              /* eslint no-console: 0 */
              console.error('Error doing card stuff', e);
              $rootScope.readerBusy = false;
            } finally {
              $rootScope.serialTimeout = setTimeout(runPoll, 150);
            }
          };
          runPoll();
        }
      },
    };
  },
];
