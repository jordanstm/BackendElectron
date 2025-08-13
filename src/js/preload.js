const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on: (channel, func) => {
      ipcRenderer.on(channel, (event, data) => {
        console.log("PRELOAD recebeu:", data); // debug
        func(data);
      });
    }
  }
});
