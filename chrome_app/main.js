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
    var nextRead = Date.now();
    var temp = '';

    serial.onReceive.addListener(function(readInfo) {
      if (Date.now() < nextRead) return;
      updateStatus('reading...');
      temp += String.fromCharCode.apply(null, new Uint8Array(readInfo.data));
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
