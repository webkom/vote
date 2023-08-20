import { alerts } from '$lib/stores';
import { onMount } from 'svelte';
import { get, writable } from 'svelte/store';

// Stateless helper functions
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

const parseData = (response: number[]) => {
  const hexValues = [];
  for (let i = 0; i < response.length; i += 1) {
    hexValues.push((response[i] < 16 ? '0' : '') + response[i].toString(16));
  }
  const stationId = hexValues[1];
  const length = hexValues[2];
  const status: keyof typeof replies = hexValues[3] as keyof typeof replies;
  const flag = hexValues[4];
  const data = hexValues.slice(5, hexValues.length - 1);
  const checksum = hexValues[hexValues.length - 1];
  const valid = validate([stationId, length, status, flag, ...data], checksum);

  const statusReply = replies[status];
  return {
    valid: valid,
    data: valid && statusReply === 'OK' ? convertUID(data) : data,
    status: statusReply,
  };
};

const DUMMY_READER_TEXT = `VOTE DUMMY READER MODE

You are now in dummy reader mode of VOTE. Use the global function "scanCard" to scan a card. The function takes the card UID as the first (and only) parameter, and the UID can be both a string or a number.

Usage: scanCard(123) // where 123 is the cardId `;

// Writable svelte store: https://svelte.dev/docs#run-time-svelte-store-writable
export const cardKeyScanStore = writable<{ cardKey: number; time: number }>(
  { cardKey: null, time: null },
  (set) => {
    // Called whenever number of subscribers goes from zero to one

    let ndef: NDEFReader = null;
    let serialDevice: {
      writer: WritableStreamDefaultWriter;
      reader: ReadableStreamDefaultReader;
    } = null;
    const readerBusy = writable(false);
    const serialTimeout = writable<NodeJS.Timeout>(null);

    // The scanner depends on values from window
    onMount(async () => {
      // Check first if dummyReader was requirested
      if (window.location.href.includes('dummyReader')) {
        window.scanCard = (cardKey: number) =>
          set({ cardKey, time: Date.now() });
        console.error(DUMMY_READER_TEXT);
      } else {
        // Attempt to open a connection
        try {
          if (
            window.navigator.userAgent.includes('Android') &&
            'NDEFReader' in window &&
            (!window.navigator.serial ||
              window.confirm(
                'You are using an Android device that (might) support web nfc. Click OK to use web nfc, and cancel to fallback to using a usb serial device.'
              ))
          ) {
            const ndefReader = new NDEFReader();
            await ndefReader.scan();
            ndef = ndefReader;
          } else {
            const port = await window.navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            serialDevice = {
              writer: port.writable.getWriter(),
              reader: port.readable.getReader(),
            };
          }
        } catch (e) {
          if (window.navigator.userAgent.includes('Android')) {
            alerts.push(e, 'ERROR');
          }
          window.location.assign('/moderator/serial_error');
          console.error(e);
        }
      }

      // Poll open connections (if one was created)
      if (ndef) {
        ndef.onreading = ({ message, serialNumber }) => {
          const data = convertUID(serialNumber.split(':'));
          set({ cardKey: data, time: Date.now() });
        };
      } else if (serialDevice && !get(serialTimeout)) {
        // Stateful helper functions for serial device
        const onComplete = (input: number[]) => {
          const { valid, status, data } = parseData(input);
          if (valid && status == 'OK' && typeof data === 'number') {
            // Debounce
            if (
              data !== get(cardKeyScanStore).cardKey ||
              Date.now() - get(cardKeyScanStore).time > 2000
            ) {
              // data = card key
              set({ cardKey: data, time: Date.now() });
            }
          }
        };
        const readResult = async () => {
          const message = [];
          let finished = false;
          let isReaderBusy = true;
          // Keep reading bytes until the "end" byte is sent
          // The "end" byte is 0xbb
          while (!finished) {
            // Stop the read if the device is busy somewhere else
            isReaderBusy = true;
            readerBusy.update((readerBusy) => {
              isReaderBusy = readerBusy;
              return true;
            });
            if (isReaderBusy) break;
            const { value } = await serialDevice.reader.read();
            readerBusy.set(false);
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
            serialDevice.writer.write(readCardCommand);
            await readResult();
          } catch (e) {
            console.error('Error doing card stuff', e);
            readerBusy.set(false);
          } finally {
            serialTimeout.set(setTimeout(runPoll, 150));
          }
        };
        runPoll();
      }
    });

    return () => {
      // Called when number of subscribers goes to zero
      serialTimeout.update((timeout) => {
        clearTimeout(timeout);
        return null;
      });
    };
  }
);
