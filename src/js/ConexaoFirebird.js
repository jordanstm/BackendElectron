// ConexaoFirebird.js
const Firebird = require('node-firebird');
const options = {
  host: 'localhost',
  port: 3050,
  database: 'c:/ecosis/dados/prado.eco',
  user: 'SYSDBA',
  password: 'masterkey',
  lowercase_keys: false,
  role: null,
  pageSize: 4096
};

const sql = `
  SELECT TestProdutoGeral.codigo, Descricao, Codigobarra, Embalagem, Fornecedor, Composicao, Marca, custoReposicao, PrSugerido, ClassificacaoFiscal, Grupo
  FROM TestProdutoGeral
  INNER JOIN TestProduto ON TestProduto.produto = TestProdutoGeral.codigo
  INNER JOIN TestFornecProduto ON TestProdutoGeral.codigo = TestFornecProduto.produto
`;

function ConsultaProdutos() {
  return new Promise((resolve, reject) => {
    Firebird.attach(options, function(err, db) {
      if (err) return reject(err);

      db.query(sql, function(err, result) {
        db.detach();
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}

module.exports = { ConsultaProdutos };
