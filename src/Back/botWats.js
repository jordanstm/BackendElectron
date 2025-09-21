const path = require('path');
const dotenv = require('dotenv');
const { start, sendTextTo, sendFileTo } = require('watsappultra');
const { app } = require('electron');

const isPackaged = app.isPackaged;
const envPath = isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join('.env');

dotenv.config({ path: envPath });

const USAIA = process.env.USAIA || '0';
const historicoMensagens = new Map();
let qrCodeRef = null;

/**
 * Inicia o bot do WhatsApp e escuta mensagens recebidas.
 */
async function initBotWats() {
  try {
    await start(
      async ({ sender, message }) => {
        console.log(`📨 Mensagem recebida de ${sender}: ${message}`);

        if (USAIA === '1' && message.body.length > 0) {
          const numero = sender;

          if (!historicoMensagens.has(numero)) {
            historicoMensagens.set(numero, []);
          }

          historicoMensagens.get(numero).push(message.body);

          if (historicoMensagens.get(numero).length > 5) {
            historicoMensagens.set(numero, historicoMensagens.get(numero).slice(-5));
          }

          const resposta = 'oi cara de boi';

          try {
            await sendTextTo(numero, resposta);
          } catch (err) {
            console.error('❌ Erro ao enviar resposta:', err);
            await sendTextTo(numero, 'Erro ao responder. Tente mais tarde.');
          }
        }
      },
      {
        headless: false,
        userDataDir: './profile',
        onQrCode: (ref) => {
          qrCodeRef = ref;
          //console.log('📸 QR Code capturado:', ref);
        }
      }
    );

    console.log('✅ Bot WatsappUltra iniciado com sucesso');
  } catch (err) {
    console.error('❌ Falha ao iniciar bot:', err);
  }
}

/**
 * Envia um arquivo para o número informado.
 * @param {string} numero - Número do cliente (ex: '+5511999999999')
 * @param {string} caminho - Caminho do arquivo
 * @param {string} [nomeArquivo='arquivo.pdf'] - Nome do arquivo
 */
async function enviarArquivo(numero, caminho, nomeArquivo = 'arquivo.pdf') {
  try {
    await sendFileTo(numero, caminho, nomeArquivo, 'Segue o arquivo solicitado 📎');
    console.log('✅ Arquivo enviado com sucesso');
  } catch (err) {
    console.error('❌ Erro ao enviar arquivo:', err);
  }
}

/**
 * Retorna o QR Code atual (ref bruto).
 */
function getQrCode() {
  return qrCodeRef;
}


module.exports = {
  initBotWats,
  enviarArquivo,
  getQrCode
};
