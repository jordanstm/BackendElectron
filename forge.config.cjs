const path = require('path');

module.exports = {
  packagerConfig: {
    asar: false, // Ativa empacotamento .asar
    compression: "maximum",
  },
  makers: [
    {
       name: '@electron-forge/maker-zip',
       platforms: ['win32'],
       
    }
  ]
};
