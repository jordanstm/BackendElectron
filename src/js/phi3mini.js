const axios = require('axios');

async function Addresser({ Message, route }) {
  try {
    const response = await axios.post('http://177.130.59.229:8080/api/generate', {
      model: 'phi3:mini',
      prompt: Message,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 segundos
    });

    return {
      route,
      resposta: response.data.response
    };
  } catch (error) {
    console.error('Erro ao consultar o modelo:', error.message);
    if (error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
    return {
      route,
      erro: 'Falha ao consultar o modelo'
    };
  }
}

module.exports = { Addresser };
