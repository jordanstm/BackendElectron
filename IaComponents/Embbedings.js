const pipeline = require ('@xenova/transformers');



function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

async function encontrarMelhorItem(dadosBD, textoCliente) {
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const vetorPergunta = (await embedder(textoCliente))[0];

  let melhorItem = null;
  let maiorSimilaridade = -1;

  for (const item of dadosBD) {
    const texto = `${item.nome}: ${item.descricao}`;
    const vetorItem = (await embedder(texto))[0];
    const sim = cosineSimilarity(vetorPergunta, vetorItem);

    if (sim > maiorSimilaridade) {
      maiorSimilaridade = sim;
      melhorItem = item;
    }
  }

  return { melhorItem, maiorSimilaridade };
}

module.exports = { encontrarMelhorItem };
