//import sql  from 'mssql';
const sql = require('mssql')
//import dotenv from 'dotenv'
const path = require('path');
const dotenv = require('dotenv')
const { app } = require('electron');
const isPackaged = app.isPackaged;

const envPath = isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join( '.env');   

dotenv.config({ path: envPath });
//dotenv.config(); // Certifique-se de que o caminho está correto para o arquivo .env
console.log('o valor do env',process.env.DB_NAME);
const sqlConfig = {
  user:'sa', //process.env.DB_USER,
  password:process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.SERVER_NAME,
  pool: {
    max: 1000,
    min: 0,
    idleTimeoutMillis: 130000
  },
  options: {
    encrypt: false, // para Azure
    trustServerCertificate: true // mude para true para desenvolvimento local / certificados autoassinados
  }
};

  async function Conexao( ) {
  try {
    // Certifique-se de que todos os itens estão corretamente codificados na URL da string de conexão
    let con= await sql.connect(sqlConfig);
    //console.log('Connexão estabelecida ',con);
    console.log('Conexao com BD estabelecida')
     return con;
   // const result = await sql.query`select * from Clientes where id = ${value}`;
   
  } catch (err) {
    // ... tratamento de erros
    console.error("Deu lhe um erro ",err);
  }
}
module.exports=  Conexao;