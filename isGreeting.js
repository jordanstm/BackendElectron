function isGreeting(texto) {
  const saudacoes = [
    'oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'fala', 'opa',
    'hello', 'salve', 'ei', 'fala fi', 'fala velho', 'i ae', 'ta vivo'
  ];

  const normalizado = texto.trim().toLowerCase();

  return saudacoes.some(saudacao => normalizado.includes(saudacao));
}

module.exports = { isGreeting };
