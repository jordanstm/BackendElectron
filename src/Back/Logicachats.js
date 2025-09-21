const{ initBotWats,enviarArquivo,getQrCode } = require('./botWats');

initBotWats();
 function RecebeQRcode(){
   return getQrCode();
 }
 
 function EnviarPDF(numero,caminho,nomeArquivo){
    enviarArquivo(numero,caminho,nomeArquivo);
}

 module.exports = {EnviarPDF,RecebeQRcode};