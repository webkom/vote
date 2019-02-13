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
    const ul = $('#port_ul');
    ul.innerHTML = '';
    updateStatus(`found ${ports.length} ports connected`);

    ports.forEach(port => {
      const newLi = document.createElement('li');
      newLi.setAttribute('data-value', port.comName);
      newLi.innerHTML = port.comName;
      ul.appendChild(newLi);
    });
    // If a device is given, connect right away
    if (process.env.SERIAL_PORT) {
      connectToDevice(process.env.SERIAL_PORT);
    }
  });

const onData = response => {
  // Callback function when data is read
  updateTarget(response);
  sound.play();
};

// Handle the 'Connect' button
const handleConnectButton = () => {
  const active = $('.active');
  if (!active) {
    return updateStatus('No device selected');
  }
  const devicePath = active.getAttribute('data-value');
  return connectToDevice(devicePath);
};
const connectToDevice = devicePath =>
  connect(
    devicePath,
    onData
  )
    .then(() => {
      $('#overlay').classList.add('hidden');
    })
    .catch(e => {
      updateStatus('Error connecting to serial port: ' + e);
    });

const setActive = e => {
  if (e.target && e.target.matches('li')) {
    const currentActive = $('.active');
    if (currentActive) {
      currentActive.classList.remove('active');
    }
    e.target.classList.add('active');
  }
};

$('#port_ul').addEventListener('click', setActive);
$('#refresh_button').addEventListener('click', updateAvailableDevices);
$('#connect_button').addEventListener('click', handleConnectButton);

updateAvailableDevices();
