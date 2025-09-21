const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

const IniciaServidores = require( './Servidores.js');

let mainWindow, tray;
const caminhoIcone = path.join(__dirname, 'src', 'images', 'logofull.png');


// function resolvePath(...segments) {
//   const base =  path.join(process.resourcesPath, 'app');
//   return path.join(base, ...segments);
// }

async function loadModules() {

 
  return IniciaServidores;
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: caminhoIcone,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
     preload: path.join(__dirname, 'preload.js')

    },
  });
mainWindow.webContents.on('console-message', (e, level, message, line, sourceId) => {
  console.log(`[Renderer ${level}] ${message}`);
});
  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
  mainWindow.setSkipTaskbar(false);

  mainWindow.on('minimize', e => { e.preventDefault(); mainWindow.hide(); });
  mainWindow.on('close', e => {
    if (!app.isQuiting) { e.preventDefault(); mainWindow.hide(); }
  });
}

app.on('ready', async () => {
  try{
           createWindow();

let ret =  await IniciaServidores({ mainWindow, ipcMain, app });

  tray = new Tray(caminhoIcone);
  tray.setToolTip('Backend');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Exibir Conector', click: () => mainWindow.show() },
    { label: 'Fechar', click: () => { app.isQuiting = true; app.quit(); } }
  ]));

  tray.on('click', () => { mainWindow.show(); mainWindow.focus(); });
  }
  catch (error) {
    console.error('Erro ao iniciar o aplicativo:', error);
  }
  
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
