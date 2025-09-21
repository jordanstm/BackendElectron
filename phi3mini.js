const axios = require('axios');
const { isGreeting } = require('./isGreeting.js');
const ListarProdutosComEstoque = require('./Executor.js').ListarProdutosComEstoque;
const functionDefinitions = require('./FunctionsDefinitions.js').functionDefinitions;
const functionHadlers = require('./FunctionHandlers.js').functionHandlers;
const encontrarProdutoMaisProvavel = require('./filtroProduto.js').encontrarProdutoMaisProvavel;
const {atendimentoComercial} = require('./PerfisAtendimento.js')
const { app } = require('electron');
const path = require('path');
const dotenv = require('dotenv')
//const encontraMelhoriten = require('./IaComponents/Embbedings.js')

const isPackaged = app.isPackaged;

const envPath = isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join( '.env')

  dotenv.config({ path: envPath });
   let LinkIA = process.env.LinkIA

async function gerarRespostaStreaming(promptFinal) {
  return new Promise((resolve, reject) => {
   // console.log('O link é', LinkIA);
    axios.post(LinkIA, {//26.2.127.77  177.130.59.229:8080
      model: 'mistral:latest',//mistral:latest foi otimo.  Iniciou com phi3:mini mas nao se mostrou sufucuente, muitos erros de portuues e de logica na resposta
      prompt: promptFinal,
      stream: true
    }, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'stream',
      timeout: 155000
    }).then(response => {
      let respostaFinal = '';

      response.data.on('data', chunk => {
        const linhas = chunk.toString('utf8').split('\n').filter(Boolean);
        for (const linha of linhas) {
          try {
            const parsed = JSON.parse(linha);
            if (parsed.response) {
              respostaFinal += parsed.response;
            }
          } catch (err) {
            console.error('❌ Erro ao parsear linha:', linha);
          }
        }
      });

      response.data.on('end', () => {
        resolve(respostaFinal.trim());
      });

      response.data.on('error', err => {
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });
  });
}

async function Addresser({ Message, route ,nome}) {
  try {
    let promptFinal;
    const produtos = await ListarProdutosComEstoque();
    //  const { melhorItem, maiorSimilaridade } = await encontraMelhoriten(dadosBD, Message);
    //  promptFinal =    `
    //  Contexto Geral:\n\n${atendimentoComercial}\n\nPergunta do cliente:\n${Message}\n\nNome do cliente: ${nome}\\ Item com maior su=imilaridade ${melhorItem ? melhorItem.nome : 'Nenhum item encontrado'}\n\nDescrição do item: ${melhorItem ? melhorItem.descricao : 'N/A'}\n\nSimilaridade: ${maiorSimilaridade.toFixed(4)}\n\nResponda de forma clara e objetiva, focando na pergunta do cliente. Se for uma saudação, responda de forma amigável. Se a pergunta for sobre um produto, utilize as informações do produto mais similar encontrado. Se não souber a resposta, admita que não sabe.\n\nResposta:`

     

    const respostaTexto = await gerarRespostaStreaming(promptFinal);
    return {
      route,
      resposta: respostaTexto
    };

  } catch (error) {
    console.error('Erro ao consultar o modelo:', error.message);
    return {
      route,
      erro: 'Falha ao consultar o modelo'
    };
  }
}

module.exports = { Addresser };
