const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on: (channel, func) => {
      ipcRenderer.on(channel, (event, data) => {
        console.log("PRELOAD recebeu:", data); // debug
        func(data);
      });
    },
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    }
  }
});

// Fora do exposeInMainWorld — escuta direta para debug
ipcRenderer.on('log', (_, msg) => {
  console.log('[LOG DO MAIN]', msg);
});
