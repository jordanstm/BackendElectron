// venomService.js
const venom = require('venom-bot');
const path = require('path');
const { Addresser } = require('./phi3mini.js');
const dotenv = require('dotenv')
const { app } = require('electron');
const { read } = require('fs');
const isPackaged = app.isPackaged;
const historicoMensagens = new Map();
const envPath = isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join( '.env')

  dotenv.config({ path: envPath });

let USAIA = process.env.USAIA
let qrCodeBase64 = null;
let clientInstance ;
let ReadyVenom = false;

async function initVenom() {
  await  venom.create({
    session: 'ultrasoft-session',
    logQR: false,
    disableWelcome: true,      
    debug: true,
    headless: true,
    puppeteerOptions: { args: ['--silent-launch','--no-sandbox'] },
    catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
      qrCodeBase64 = base64Qr;
      console.log('QR Code capturado', qrCodeBase64);
    }
  })
  
  .then((client) => {
      ReadyVenom = true;
      clientInstance = client;
    console.log('Venom iniciado com sucesso');
    stateConnection(client);
    start(client);  
    return client;
  })
  .catch((err) => {
    console.error('Erro ao iniciar Venom:', err);
  });
}
function stateConnection(client) {
  return client.onStateChange((state) => {
    console.log('Estado da sessão:', state);
    if (state === 'CONNECTED') {
      qrCodeBase64 = 'CONNECTED'; // ou qualquer flag que o frontend reconheça
    }
     
  });
}
function start(client) {

client.onMessage(async (message) => {

    if(USAIA == '1'){ // Verifica se a variável USAIA está ativa
      if (message.body.length > 0 && message.isGroupMsg === false) {
    try {
      
      


      const contato = await client.getContact(message.from);
      const nomeCliente = contato.pushname || contato.name || 'cliente';
      const numero = message.from;

if (!historicoMensagens.has(numero)) {
  historicoMensagens.set(numero, []);
}
historicoMensagens.get(numero).push(message.body);

// Limita a 5 mensagens
if (historicoMensagens.get(numero).length > 5) {
  historicoMensagens.set(numero, historicoMensagens.get(numero).slice(-5));
}

// const contexto = historicoMensagens.get(numero).join('\n');

// const resposta = await Addresser({
//   Message: contexto,
//   route: 'whatsapp',
//   nome: nomeCliente
// });
    

       await client.startTyping(message.from);
      const textoResposta ="oi cara de boi" //resposta.resposta      

      await client.sendText(message.from, textoResposta);//envio da resposta

    } catch (err) {
      console.error('Erro ao responder mensagem:', err);
      await client.sendText(message.from, 'Ocorreu um erro ao tentar responder. Tente novamente mais tarde.');
    }
  }


  

    }

});


}

function getQrCode() {

  
  return qrCodeBase64;
}

// filepath: c:\BackendUltraElectron\BackendElectron\wapp.js
async function enviarPdf(numero, caminhoPdf, nomeArquivo = 'documento.pdf') {
  if (!clientInstance || !ReadyVenom) throw new Error('Cliente Venom não está pronto');
  const numeroFormatado = `${numero}@c.us`;
  let caminho = path.resolve(caminhoPdf);
  console.log('Caminho do PDF:', caminho);
  const fs = require('fs');
  await clientInstance.sendFile(
    numeroFormatado,
    caminho,
    nomeArquivo,
    'Olá! Segue o PDF solicitado 📄'
  );
}
module.exports = {
  initVenom,
  getQrCode,
  enviarPdf
};
