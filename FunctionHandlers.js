const Executor = require('./Executor.js').Executor;
const functionHandlers = {
  getProductPrice: async ({ productName }) => {
     let Produto = await Executor.ConsultaSimplesProduto(productName);
    return `O preço da ${productName} é R$ ${Produto[0].Precovenda}.`;
  },
  getGreetingResponse: async () => {
    return '👋 Olá! Me diga o nome de um produto e eu te informo o preço.';
  }
};
module.exports={ functionHandlers }