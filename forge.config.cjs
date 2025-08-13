const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
     extraResources: [
      path.resolve(__dirname, '.env')
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'backend-ultrasoft'
      }
    }
  ]
};
