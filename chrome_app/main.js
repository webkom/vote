var serial = chrome.serial;
var sound = new Audio('assets/cardread.mp3');

var $ = function(selector) {
    return document.querySelector(selector);
};

var updateStatus = function(status) {
    var statusbox = $('#status_text');
    statusbox.innerHTML = status;
};

var updateTarget = function(value) {
    var wv = $('webview');
    wv.contentWindow.postMessage(value, '*');
};

var commands = {
  BUZZER: 0x89,
  MIFARE: {
    GET_SNR: 0x25
  }
};

var replies = {
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

var calculateChecksum = function(command, data) => {
  const payload = [data.length + 1, command, ...data];
  const checksum = payload.reduce((previousValue, currentValue) => previousValue ^ currentValue);
  return [...payload, checksum];
}

var poll = function(connectionId) {
  var command = this.createMessage(commands.MIFARE.GET_SNR, [0x26, 0x00]);
  this.writeAndDrain(connectionId, command, poll);
 }

var writeAndDrain = function(connectionId, data, callback) => {
  chrome.serial.send(connectionId, data, function (sendInfo) {
    if (sendInfo.error) {
      updateStatus('RFID Error:' + sendInfo.error)
    }

    writeAndDrain(connectionId, data, callback);
 });
}

var validate = function(data, checksum) => {
  const dataDecimal = data.map((item) => parseInt(item, 16));
  const calculatedChecksum = dataDecimal
    .reduce((previousValue, currentValue) => previousValue ^ currentValue);
  return Math.abs(calculatedChecksum % 255) === parseInt(checksum, 16);
}

var onData = function(response) => {
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
  if (this.replies[status] === 'OK' && this.replies[flag] !== 'NO CARD' && valid) {
    this.emit('rfid', data.join(':'));
  }
}

var createMessage = function(command, data) => {
  const payload = calculateChecksum(command, data);
  return new Buffer([0xAA, 0x00, ...payload, 0xBB]);
}

// Populate the list of available devices
var refresh = function() {
    serial.getDevices(function(ports) {
        // get drop-down port selector
        var dropDown = $('#port_list');
        updateStatus('found ' + ports.length + ' ports connected');
        dropDown.innerHTML = '';

        // add new options
        ports.forEach(function(port) {
            var displayName = port.displayName + '(' + port.path + ')';
            if (!displayName) displayName = port.path;

            var newOption = document.createElement('option');
            newOption.text = displayName;
            newOption.value = port.path;
            dropDown.appendChild(newOption);
        });
    });
};

$('#refresh_button').addEventListener('click', refresh);

// Handle the 'Connect' button
$('#connect_button').addEventListener('click', function() {
    // get the device to connect to
    var dropDown = $('#port_list');
    var devicePath = dropDown.options[dropDown.selectedIndex].value;
    // connect

    serial.connect(devicePath, { bitrate: 9600 }, function(info) {
        updateStatus('connected');
        var connectionId = info.connectionId;
        var nextRead = Date.now();
        var temp = '';
        poll();

        serial.onReceive.addListener(function(readInfo) {
            if (Date.now() < nextRead) return;
            updateStatus('reading...');
            temp += String.fromCharCode.apply(null, new Uint8Array(readInfo.data));
            console.log(temp);
            if (temp.length > 11) {
                updateTarget(temp.substring(0, 11));
                temp = '';
                updateStatus('reading...completed');
                sound.play();
                nextRead = Date.now() + 2000;
            }
        });
    });
});

$('#fullscreen').addEventListener('click', function() {
    chrome.app.window.current().fullscreen();
});

$('#test').addEventListener('click', function() {
    updateTarget('test');
});

refresh();
