const { ipcRenderer, contextBridge } = require('electron');
let system = '';

contextBridge.exposeInMainWorld('electron', {
  send: async (channel, data) => {
    // System
    system = ['system'];
    if (system.includes(channel)) {
      ipcRenderer.send(channel, data);
    }

    // Storage
    system = ['storage'];
    if (system.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
  },
  receive: (channel, func) => {
    // System
    system = ['system'];
    if (system.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (_event, data) => func(data));
    }

    // Storage
    system = ['storage'];
    if (system.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (_event, data) => func(data));
    }
  },
});
