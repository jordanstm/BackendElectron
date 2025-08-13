const path = require('path');
const express = require('express');
const http = require('http');
const { Server: socketIo } = require('socket.io');
 const  Executor  = require('./Executor.js');
  const Addresser = require ('./Validator.js')
  const Phi3mini = require ('./phi3mini.js')
 const expressApp = express();
  const apiServer = http.createServer(expressApp);
  const socketServer = http.createServer();
  const io = new socketIo(socketServer);

async function IniciaServidores({ mainWindow, ipcMain, app }) {
  const expressApp = express();
  const apiServer = http.createServer(expressApp);
  const socketServer = http.createServer();
  const io = new socketIo(socketServer);

  expressApp.use(express.json());

  expressApp.get('', (req, res) => res.send('API funcionando!'));

  // 🔥 Inicia o Venom antes de servir o QR
  const venomService = require('./wapp');
 //  // <- isso é essencial

  expressApp.get('/download', (req, res) => {
    const filePath = path.join(__dirname, 'download', 'Ultrasoft.apk');
    res.download(filePath, 'aplicativo.apk', (err) => { if (err) res.end(); });
  });

  expressApp.get('/Produtos', async (req, res) => {
    try {
      const result = await Executor.ListaProdutos(req.body);
      if (result) res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).send('Erro interno');
    }
  });

  expressApp.post('/IA', async (req, res) => {
    const { Message, route } = req.body;
    const response = await Phi3mini.Addresser({ Message, route });
    res.json(response);
  });

  expressApp.get('/qr', (req, res) => {
    const qr = venomService.getQrCode();
    if (qr) {
      res.send(`<img src="${qr}" />`);
    } else {
      res.send('QR Code ainda não disponível');
    }
  });

  io.on('connection', (socket) => {
    console.log(`Novo cliente conectado: ${socket.id}`);
    mainWindow.webContents.send('cliente-conectado', `Novo cliente conectado: ${socket.id}`);

    socket.on('disconnect', () => console.log('Cliente desconectado'));

    socket.on('message', async (message, callback) => {
      const ident = JSON.parse(message);
      const { route, message: msg } = ident;
      const resp = await Addresser({ Message: msg, route });
      mainWindow.webContents.send('Retorno', `Dados: ${JSON.stringify(resp)}`);
      callback(resp);
    });
  });

  io.on('SendMessage', (message) => {
    Executor.ListaProdutos(message)
      .then((res) => io.emit('ReceiveMessage', res))
      .catch((err) => console.error(err));
  });

  apiServer.listen(8099, () => console.log('Servidor de API rodando na porta 8099'));
  socketServer.listen(8091, () => console.log('Servidor de sockets rodando na porta 8091'));
// await venomService.initVenom();
  ipcMain.on('renderer-ready', (event) => {
    event.sender.send('cliente-conectado', 'Renderizador pronto');
  });
setTimeout(async () => {
  try {
    await venomService.initVenom();
  } catch (err) {
    console.error('Erro ao iniciar Venom:', err);
  }
}, 1000); // espera 3 segundos
  
}


module.exports = IniciaServidores;


