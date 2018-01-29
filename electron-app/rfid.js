const { refresh, connect } = require('card-scanner');
const sound = new Audio('assets/cardread.mp3');

const $ = selector => {
  return document.querySelector(selector);
};

const wv = $('webview');
wv.addEventListener('console-message', e => {
  // eslint-disable-next-line
  console.log('Guest page logged a message:', e.message);
});

const updateStatus = status => {
  const statusbox = $('#status_text');
  statusbox.innerHTML = status;
};

const updateTarget = value => {
  wv.send('message', value);
};

// Populate the list of available devices
const updateAvailableDevices = () =>
  refresh().then(ports => {
    const dropDown = $('#port_list');
    updateStatus(`found ${ports.length} ports connected`);
    dropDown.innerHTML = '';

    ports.forEach(port => {
      const newOption = document.createElement('option');
      newOption.text = port.comName;
      newOption.value = port.comName;
      dropDown.appendChild(newOption);
    });
  });

const onData = response => {
  // Callback function when data is read
  updateTarget(response);
  sound.play();
  updateStatus('reading...completed');
};

// Handle the 'Connect' button
const connectToDevice = () => {
  const dropDown = $('#port_list');
  const devicePath = dropDown.options[dropDown.selectedIndex].value;
  connect(devicePath, onData).then(() => {
    updateStatus('connected');
  });
};

$('#refresh_button').addEventListener('click', updateAvailableDevices);
$('#connect_button').addEventListener('click', connectToDevice);
$('#fullscreen').addEventListener('click', () => {});
$('#test').addEventListener('click', () => {
  updateTarget('test');
});

updateAvailableDevices();
