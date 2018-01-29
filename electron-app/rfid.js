const SerialPort = require('serialport');
const memoize = require('lodash.memoize');
const debounce = require('lodash.debounce');
const sound = new Audio('assets/cardread.mp3');

let port = null;
const READ_DELAY = 500;

const $ = selector => {
  return document.querySelector(selector);
};

const updateStatus = status => {
  const statusbox = $('#status_text');
  statusbox.innerHTML = status;
};

const updateTarget = value => {
  const wv = $('webview');
  wv.send('message', value);
};

const commands = {
  BUZZER: 0x89,
  MIFARE: {
    GET_SNR: 0x25
  }
};

const replies = {
  '0': 'OK', // eslint-disable-line
  '1': 'ERROR', // eslint-disable-line
  '83': 'NO CARD', // eslint-disable-line
  '87': 'UNKNOWN INTERNAL ERROR', // eslint-disable-line
  '85': 'UNKNOWN COMMAND', // eslint-disable-line
  '84': 'RESPONSE ERROR', // eslint-disable-line
  '82': 'READER TIMEOUTE', // eslint-disable-line
  '90': 'CARD DOES NOT SUPPORT THIS COMMAND', // eslint-disable-line
  '8f': 'UNNSUPPORTED CARD IN NFC WRITE MODE' // eslint-disable-line
};

const calculateChecksum = (command, data) => {
  const payload = [data.length + 1, command, ...data];
  const checksum = payload.reduce(
    (previousValue, currentValue) => previousValue ^ currentValue
  );
  return [...payload, checksum];
};

const poll = () => {
  const command = createMessage(commands.MIFARE.GET_SNR, [0x26, 0x00]);
  writeAndDrain(command, poll);
};

const writeAndDrain = (data, callback) => {
  port.write(data, () => {
    port.drain(callback);
  });
};

const validate = (data, checksum) => {
  const dataDecimal = data.map(item => parseInt(item, 16));
  const calculatedChecksum = dataDecimal.reduce(
    (previousValue, currentValue) => previousValue ^ currentValue
  );
  return Math.abs(calculatedChecksum % 255) === parseInt(checksum, 16);
};

const memoizeDebounce = (func, wait = 0, options = {}) => {
  const mem = memoize(param => debounce(func, wait, options));
  return param => mem(param)(param);
};

const updateOrDebounce = memoizeDebounce(
  data => {
    updateTarget(data);
    sound.play();
    updateStatus('reading...completed');
  },
  READ_DELAY,
  { leading: true, trailing: false }
);

const onData = response => {
  const hexValues = [];
  for (let i = 0; i < response.length; i += 1) {
    hexValues.push(response[i].toString(16));
  }
  const stationId = hexValues[1];
  const length = hexValues[2];
  const status = hexValues[3];
  const flag = hexValues[4];
  const data = hexValues.slice(5, hexValues.length - 1);
  const checksum = hexValues[hexValues.length - 1];
  const valid = validate([stationId, length, status, flag, ...data], checksum);
  if (replies[status] === 'OK' && replies[flag] !== 'NO CARD' && valid) {
    updateOrDebounce(data.join(':'));
  }
};

const createMessage = (command, data) => {
  const payload = calculateChecksum(command, data);
  return new Buffer([0xaa, 0x00, ...payload, 0xbb]);
};

// Populate the list of available devices
const refresh = () => {
  SerialPort.list((err, ports) => {
    const dropDown = $('#port_list');
    updateStatus(`found ${ports.length} ports connected`);
    dropDown.innerHTML = '';

    ports.forEach(port => {
      let displayName = port.comName;
      if (!displayName) displayName = port.path;

      const newOption = document.createElement('option');
      newOption.text = displayName;
      newOption.value = port.comName;
      dropDown.appendChild(newOption);
    });
  });
};

$('#refresh_button').addEventListener('click', refresh);

// Handle the 'Connect' button
const connect = () => {
  // get the device to connect to
  const dropDown = $('#port_list');
  const devicePath = dropDown.options[dropDown.selectedIndex].value;
  // connect

  port = new SerialPort(devicePath, { autoOpen: false });
  port.open(err => {
    updateStatus('connected');
    const Delimiter = SerialPort.parsers.Delimiter;
    const parser = port.pipe(new Delimiter({ delimiter: [0xbb] }));
    parser.on('data', onData);
    poll();
  });
};

$('#connect_button').addEventListener('click', connect);

$('#fullscreen').addEventListener('click', () => {});

$('#test').addEventListener('click', () => {
  updateTarget('test');
});

refresh();
