import { readable, writable } from 'svelte/store';

const checksum = (data: number[]) =>
  data.reduce((previousValue, currentValue) => previousValue ^ currentValue);

const createMessage = (command: number, data: number[]) => {
  const payload = [data.length + 1, command, ...data];
  payload.push(checksum(payload));

  return new Uint8Array([0xaa, 0x00, ...payload, 0xbb]).buffer;
};

const convertUID = (data: string[]) => {
  const reversed = data
    .join('')
    .match(/.{1,2}/g)
    .reverse()
    .join('');
  return parseInt(reversed, 16);
};

const validate = (data: string[], receivedChecksum: string) => {
  const dataDecimal = data.map((item) => parseInt(item, 16));
  const calculatedChecksum = checksum(dataDecimal);
  return Math.abs(calculatedChecksum % 255) === parseInt(receivedChecksum, 16);
};

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

const parseData = (response: number[]) => {
  const hexValues = [];
  for (let i = 0; i < response.length; i += 1) {
    hexValues.push((response[i] < 16 ? '0' : '') + response[i].toString(16));
  }
  const stationId = hexValues[1];
  const length = hexValues[2];
  const status = hexValues[3] as keyof typeof replies;
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

const createScanner = () => {
  let interval: NodeJS.Timer;
  let readerBusy = false;

  let lastTime: number;
  let lastData: unknown;

  const { subscribe, update, set } = writable<number | string[]>(
    0,
    () => () => clearInterval(interval)
  );

  return {
    subscribe,
    init: async () => {
      const port = await window.navigator.serial.requestPort({});
      await port.open({ baudRate: 9600 });

      const serialDevice = {
        writer: port.writable.getWriter(),
        reader: port.readable.getReader(),
      };

      const onComplete = (input) => {
        const { valid, status, data } = parseData(input);
        if (valid && status == 'OK') {
          // Debounce
          if (data !== lastData || Date.now() - lastTime > 2000) {
            // data = card id
            set(data);
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
          if (readerBusy) break;
          readerBusy = true;
          const { value } = await serialDevice.reader.read();
          readerBusy = false;
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

      interval = setInterval(async () => {
        try {
          serialDevice.writer.write(readCardCommand);
          await readResult();
        } catch (e) {
          /* eslint no-console: 0 */
          console.error('Error doing card stuff', e);
          readerBusy = false;
        }
      }, 150);
      return;
    },
  };
};

export default createScanner();
