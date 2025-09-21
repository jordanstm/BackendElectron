const stringSimilarity = require('string-similarity');

/**
 * 🔍 ENCONTRA O PRODUTO MAIS PARECIDO COM A PERGUNTA
 * @param {Array} produtos - Lista de produtos do banco
 * @param {string} pergunta - Texto da pergunta do cliente
 * @returns {Object} produto mais parecido
 */
function encontrarProdutoMaisProvavel(produtos, pergunta) {
  const descricoes = produtos.map(p => p.Descricao);
  const resultado = stringSimilarity.findBestMatch(pergunta, descricoes);
  const melhorMatch = resultado.bestMatch.target;

  return produtos.find(p => p.Descricao === melhorMatch);
}

module.exports = { encontrarProdutoMaisProvavel };
