const { ipcRenderer } = require('electron');
ipcRenderer.on('message', (event, value) => {
  window.postMessage(value, '*');
});
