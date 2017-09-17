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

var onData = function(response) {
    const hexValues = [];
    for (let i = 0; i < response.length; i += 1) {
        hexValues.push(response[i].toString(16));
    }
    const status = hexValues[3];
    const flag = hexValues[4];
    const data = hexValues.slice(5, hexValues.length - 1);
    if (replies[status] === 'OK' && replies[flag] !== 'NO CARD') {
        updateTarget(data.join(':'));
        updateStatus('reading...completed');
        sound.play();
    } else {
        updateStatus('reading...failed:' + replies[status]);
    }
};

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
        updateStatus('connected: ' + info.connectionId);
        var temp = [];

        serial.onReceive.addListener(function(readInfo) {
            updateStatus('reading...');
            temp.push(new Uint8Array(readInfo.data));
            if (temp.length >= 11) {
                onData(temp);
                temp = [];
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
