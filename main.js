const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow, tray;
const caminhoIcone = path.join(__dirname, 'src', 'images', 'logofull.png');

async function loadModules() {
  const  IniciaServidores  = require('./src/js/Servidores.js');
  return  IniciaServidores ;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: caminhoIcone,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'js', 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
  mainWindow.setSkipTaskbar(false);

  mainWindow.on('minimize', e => { e.preventDefault(); mainWindow.hide(); });
  mainWindow.on('close', e => {
    if (!app.isQuiting) { e.preventDefault(); mainWindow.hide(); }
  });
}

app.on('ready', async () => {
  createWindow();
  const  IniciaServidores  = await loadModules();
  await IniciaServidores({ mainWindow, ipcMain, app });

  tray = new Tray(caminhoIcone);
  tray.setToolTip('Backend');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Exibir Conector', click: () => mainWindow.show() },
    { label: 'Fechar', click: () => { app.isQuiting = true; app.quit(); } }
  ]));

  tray.on('click', () => { mainWindow.show(); mainWindow.focus(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
