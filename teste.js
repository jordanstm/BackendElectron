const venom = require('venom-bot');

venom.create({
  session: 'teste',
  headless: false,
  debug: true
}).then((client) => {
  console.log('Venom conectado');

  client.onMessage((message) => {
    console.log('Mensagem recebida:', {
      from: message.from,
      body: message.body,
      isGroupMsg: message.isGroupMsg
    });
  });
});

