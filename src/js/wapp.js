// venomService.js
const venom = require('venom-bot');
const path = require('path');
let qrCodeBase64 = null;
let clientInstance = null;

async function initVenom() {
  return venom.create({
    session: 'ultrasoft-session',
    logQR: false,
    disableWelcome: true,
    debug: false,
    multidevice: true,
    qrTimeout: 0,
    headless: true,
    puppeteerOptions: { args: ['--silent-launch','--no-sandbox'] },
    catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
      qrCodeBase64 = base64Qr;
      console.log('QR Code capturado');
    }
  })
  .then((client) => {
    clientInstance = client;
    start(client);
    return client;
  })
  .catch((err) => {
    console.error('Erro ao iniciar Venom:', err);
  });
}

function start(client) {
  client.onMessage(async (message) => {
    if (message.body === 'Oi' && message.isGroupMsg === false) {
      await client.sendText(message.from, 'Olá! Tudo bem?');
    }
  });
}

function getQrCode() {
  return qrCodeBase64;
}
async function enviarPdf(numero, caminhoPdf, nomeArquivo = 'documento.pdf') {
  if (!clientInstance) throw new Error('Cliente Venom não está pronto');
  const numeroFormatado = `${numero}@c.us`;

  await clientInstance.sendFile(
    numeroFormatado,
    path.resolve(caminhoPdf),
    nomeArquivo,
    'Olá! Segue o PDF solicitado 📄'
  );
}
module.exports = {
  initVenom,
  getQrCode,
  enviarPdf
};
