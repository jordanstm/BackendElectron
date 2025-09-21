const path = require('path');
const express = require('express');
const http = require('http');
const { Server: socketIo } = require('socket.io');
const Executor = require('./Executor.js');
const Addresser = require('./Validator.js')
const Phi3mini = require('./phi3mini.js')
const {EnviarPDF,RecebeQRcode} = require('./src/Back/Logicachats.js');
const expressApp = express();
const apiServer = http.createServer(expressApp);
const socketServer = http.createServer();
const io = new socketIo(socketServer);
const basePath = process.resourcesPath || __dirname;
const log = require('electron-log');




expressApp.use(express.json());
async function IniciaServidores({ mainWindow, ipcMain, app }) {
  try {
   
  expressApp.get('', (req, res) => res.send('API funcionando!'));
 
  function FormataResposta(paraIn){
     switch(paraIn.rota){
      case'/validaUsuario':
       if(paraIn.resposta)
        return JSON.stringify({ usuario: true });
      case '/validaSenha':
        if(paraIn.resposta)
        return JSON.stringify({ senha: true });
      case '/InsereItem':
        if(paraIn.resposta)
          return JSON.stringify({ data:paraIn.resposta });
        case '/login':
          if(paraIn.resposta === 'true')
          {
             mainWindow.webContents.send('log', 'menssagem no switch '+ paraIn.resposta);
               return JSON.stringify({ sucesso: true });
          }
        
       case '/Mesas':
       //  if(paraIn.resposta){
          log.info('Valor recebido em Mesas:', paraIn.resposta);
          return JSON.stringify( paraIn.resposta );
 
       //  }
                  default:
       return  paraIn.resposta ;
     }
     
  }

  expressApp.get('/download', (req, res) => {
    console.log('Download solicitado');
    const filePath = path.join(basePath, 'download', 'Ultrasoft.apk');
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
 let QR = null;
expressApp.get('/qr', (req, res) => {

const qr =  RecebeQRcode();
  if (qr) {
    console.log('QR Code solicitado =>',qr);

    if( qr.QrCode !== QR){
      QR = qr.QrCode;
     res.send(qr);
    } 
  } else {
    res.send('NOT_READY'); // resposta clara para estado inicial
  }
});

  expressApp.post('/enviar-pdf', async (req, res) => {
    const { numero, caminhoPdf, nomeArquivo } = req.body;
    try {
     // await venomService.enviarPdf(numero, caminhoPdf, nomeArquivo);
     let Nr = formatarNumero(numero);
     await EnviarPDF(Nr,caminhoPdf,nomeArquivo);
      res.send('PDF enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar PDF:', error);
      res.status(500).send('Erro ao enviar PDF');
    }
  });
 
   expressApp.post('/enviarPedido', async (req, res) => {
    const { numero, caminhoPdf, nomeArquivo } = req.body;
    try {
     // await venomService.enviarPdf(numero, caminhoPdf, nomeArquivo);
     let Nr = formatarNumero(numero);
     await enviarPdf(Nr,caminhoPdf,nomeArquivo);
      res.send('PDF enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar PDF:', error);
      res.status(500).send('Erro ao enviar PDF');
    }
  });

  io.on('connection', (socket) => {
    console.log(`Novo cliente conectado: ${socket.id}`);
    mainWindow.webContents.send('cliente-conectado', `Novo cliente conectado: ${socket.id}`);

    socket.on('disconnect', () => console.log('Cliente desconectado'));

    socket.on('message', async(message, callback) => {
      const ident = JSON.parse(message);
      const { route, message: msg } = ident;
       mainWindow.webContents.send('log', 'A rota que Chegou '+route);
       let ret = await Addresser({ Message: msg, route, mainWindow })
    
     callback(ret);


    });
  });

  
   function formatarNumero(numero) {
  // Remove qualquer caractere não numérico
  const limpo = numero.replace(/\D/g, '');

  // Verifica se tem 12 dígitos (ex: 55 + DDD + número)
  if (limpo.length !== 12) {
    console.warn('Número inválido:', numero);
    return numero;
  }

  const ddi = limpo.slice(0, 2);      // +55
  const ddd = limpo.slice(2, 4);      // DDD
  const parte1 = limpo.slice(4, 8);   // primeiros 4 dígitos
  const parte2 = limpo.slice(8);      // últimos 4 dígitos

  return `+${ddi} ${ddd} ${parte1}-${parte2}`;
}


  io.on('SendMessage', (message) => {
    Executor.ListaProdutos(message)
      .then((res) => io.emit('ReceiveMessage', res))
      .catch((err) => console.error(err));
  });

  apiServer.listen(8099, () => console.log('Servidor de API rodando na porta 8099'));
  socketServer.listen(8091, () => console.log('Servidor de sockets rodando na porta 8091'));
   mainWindow.webContents.send('log','Servdores rodando portas 8099 e 8091');
   // await venomService.initVenom();
  ipcMain.on('renderer-ready', (event) => {
    event.sender.send('cliente-conectado', 'Renderizador pronto');
  });
  mainWindow.webContents.send('log', 'Servidor iniciado com sucesso');
 
setTimeout(async () => {
  try {

    //await venomService.initVenom();
  } catch (err) {
    console.error('Erro ao iniciar Venom:', err);
  }
}, 2000); // espera 2 segundos
  return 'Ligou todoso os caraio'

  } catch (error) {
    console.error('Erro ao iniciar servidores:', error);
  }

  


}


module.exports = IniciaServidores;


