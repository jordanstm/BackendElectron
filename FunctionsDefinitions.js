const functionDefinitions = [
  {
    name: 'getProductPrice',
    description: 'Retorna o preço de um produto pelo nome',
    parameters: {
      type: 'object',
      properties: {
        productName: { type: 'string', description: 'Nome do produto' }
      },
      required: ['productName']
    }
  },
  {
    name: 'getGreetingResponse',
    description: 'Responde a uma saudação inicial',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
];

module.exports={ functionDefinitions }