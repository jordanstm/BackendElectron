import sql  from 'mssql';
import dotenv from 'dotenv'
dotenv.config(); // Certifique-se de que o caminho está correto para o arquivo .env
console.log('o valor do env',process.env.DB_NAME);
const sqlConfig = {
  user:'sa', //process.env.DB_USER,
  password:'987589', //process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: 'localhost',//process.env.SERVER_NAME,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // para Azure
    trustServerCertificate: true // mude para true para desenvolvimento local / certificados autoassinados
  }
};

 export async function Conexao( ) {
  try {
    // Certifique-se de que todos os itens estão corretamente codificados na URL da string de conexão
    let con= await sql.connect(sqlConfig);
    //console.log('Connexão estabelecida ',con);
     return con;
   // const result = await sql.query`select * from Clientes where id = ${value}`;
    //console.dir(result);
  } catch (err) {
    // ... tratamento de erros
    console.error("Deu lhe um erro ",err);
  }
}
export  {sql};