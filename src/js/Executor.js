import { Conexao } from "./Connect.js";
import path, { dirname } from 'path';
import fs from 'fs'
import { fileURLToPath } from 'url';
//let {Conexao} = require("./Connect") ;

export async function Executor(SQL){
    //console.log("A conexao esta assim ",Conexao.Conexao())
    let pool  = await  Conexao()
  return await pool.request().query(SQL)
   // console.log("A conexao esta assim",res);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
const GravarLog=async(log)=>{
    path = __dirname + '/log.txt';
    await fs.writeFileSync(path,log )

}
 export const TestaConexao=async()=>{
    try{

   let result=  await   Executor(`Select * from clientes`)
        console.log('Conexao realizada com sucesso!');
        console.log('O Resultado com sucesso',result.recordset);
    }catch(err){
        console.error(`Erro ao conectar ao banco de dados: ${err}`);
    }
}
const MaxCodigo= async(NomeTabela)=>{
    let sql = `Select Max(Codigo)+ 1 from ${NomeTabela}`

    return await Executor(sql)
    .then((dados) => {
            if(dados != undefined){
             let estado= dados[0];
              if(estado.length>0)
              return estado;
              else
               return 1
          }
          else
           return 1;
     
    }).catch((err) => { GravarLog(err)
      console.error('Erro ao alterar QTD Item'+err);
    })
  }

export const ListaProdutos= async(Text)=>{
   let colunas = 'Codigo,Descricao,PrecoVenda,EAN'
    let resultado='';
    try{
        let tipo = isNumeric(Text)
        let SQL=''
         if(tipo== false){
            SQL= `SELECT ${colunas} FROM Produtos WHERE Descricao LIKE '%${Text}%'`
         }
         else{
             if(Text.length == 13){
               SQL=`SELECT ${colunas}  FROM Produtos where NUMERO= '${Text}'`
             }
             else{
               SQL=`SELECT ${colunas}  FROM Produtos where Codigo= ${Text}`;
             }
            
         }
        
         resultado= await  Executor(SQL)
       
     //  console.log("O resultado do produto é",resultado.recordset) 
       return resultado.recordset

    }
    catch(err){console.error(err)
    }
 return resultado;
 }
 export async function ValidaUsuario(Usuario){
    try{
        let SQL=`SELECT * FROM Usuarios WHERE Descricao='${Usuario}'`
        let resultado= await Executor(SQL)
        console.log('Resultado da validação de usuário:', resultado); 
        if(resultado.recordset.length > 0){
            return true; // Usuário encontrado
        }
    }catch(err){
        console.error(err)
    }

    return false; // Usuário não encontrado
}

export async function ValidaSenha(Senha){
    try{
        let SQL=`SELECT * FROM Usuarios WHERE  Senha='${Senha}'`
        let resultado= await Executor(SQL)
        console.log('Resultado da validação de senha:', resultado);
        if(resultado.recordset.length > 0){
            return true; // Senha válida
        }
    }catch(err){
        console.error(err)
    }

    return false; // Senha inválida
}

function isNumeric(value) {
   // Remove aspas duplas, se existirem
   value = value.replace(/"/g, '');
   // Verifica se o valor é um número
   return !isNaN(parseFloat(value)) && isFinite(value);
}
export async function ListarMesas(params) {
    try {
        let SQL = `SELECT * FROM Quarto`
        if(params) {
            let tipo = isNumeric(params);
            if(tipo) {
                SQL += ` WHERE Codigo = ${params}`;
            } else {
                SQL += ` WHERE Descricao LIKE '%${params}%'`;
            }
        }
        let resultado = await Executor(SQL);
        return resultado.recordset;
    } catch (error) {
        console.error('Erro ao listar mesas:', error);
        throw new Error('Erro ao listar mesas');
    }
}
export const ListarProdutosComEstoque = async (P) => {
  let SQL = `select P.Codigo,LTRIM(RTRIM(P.Descricao))Descricao,LTRIM(RTRIM(P.Unidade)) as Unidade,P.PrecoVenda,P.Ean,Ltrim(Rtrim(P.Caracteristicas)) as Caracteristicas ,ROUND((Ce.QtdEntrada-(ce.QtdSaida+Ce.QtdVenda)),2)as Estoque from produtos P inner Join ControleEstoque Ce on Ce.CodProd= P.codigo`;
  
  SQL += ` where  P.Listar=1`
  if (P) {
    if(isNaN(P)==false){
      SQL += ` and P.Codigo=${P}`  
      
    }
    
    else {
        if(isNaN(P)){
          SQL+=` and Descricao like'%${P}%'`
          
        }
    }

  }

   let resultado= await Executor(SQL)
   if(resultado.recordset.length > 0){
       return resultado.recordset;
   }
}
export const ListaItensLancados=async (Param)=>{
  let SQL = `select P.Codigo,P.Descricao,P.Unidade,P.PrecoVenda,MovAtendItens.Qtd,MovAtendItens.Cod from produtos P `;
  SQL += ` Inner join MovAtendItens on CodIten = P.Codigo inner join MovAtend on MovAtend.Codigo = MovAtendItens.Codigo`
  SQL += ` where  MovAtend.Status='P' and Cast(MovAtend.DataInicio as date)= (Select cast (GetDate() as date))`
  if (Param.NroMesa) {
    if(isNaN(Param.NroMesa)==false){
      SQL += ` and MovAtend.NrMesa=${Param.NroMesa}`  
      
    }        
   
    }
     let resultado= await Executor(SQL)
   if(resultado.recordset.length > 0){
       return resultado.recordset;
   }
}
export const ListaItensVenda=async(Param)=>{
  let SQL = `select P.Codigo,P.Descricao,P.Unidade,P.PrecoVenda,I.Qtd,I.Cod from produtos P `;
  SQL += ` Inner join ItensVenda I on I.CodProd = P.Codigo inner join Vendas V on V.Codigo = I.Codigo`
  SQL += ` where  V.Situacao='P' and Cast(V.Data as date)= (Select cast (GetDate() as date))`

  if (Param.NroMesa) {
    if(isNaN(Param.NroMesa)==false){
      SQL += ` and V.Mesa=${Param.NroMesa}`  
      
    }        
   
    }
     let resultado= await Executor(SQL)
   if(resultado.recordset.length > 0){
       return resultado.recordset;
   }
}
const PegaCodgoDoAtendimentoAtual= async (Atendimento)=>{
     let SQL = `Select Max(Codigo) as Codigo from MovAtend where Status ='P' and NrMesa=`+Atendimento.NroMesa
     return await Executor(SQL)
     .then((dados) => {
      let codigo  = dados.recordset[0].Codigo
       if(undefined == codigo){
        codigo=1
       }
       return codigo;
     }).catch((err) => {GravarLog(err)
       console.error('Erro no Inicia Atendimento'+err);
     })

}
const MaxCodigoMovAtend=async()=>{
  return await Executor('Select Max(Codigo)+1 as Codigo from MovAtend').then((dados) => {
    let Cod = dados[0]
     if(dados.length>0){
       Cod = Cod.Codigo
        if(Cod==undefined){
          Cod =1
        }
     }
     else{
       Cod=1
     }
    return Cod;
  }).catch(e=>{GravarLog(e)})
}
function FormatDateSQLServer(date){
  
  let Dia = date.getDate()<10? "0"+date.getDate():date.getDate();
  let Mes = date.getMonth()<10?"0"+(date.getMonth()+1):date.getMonth()+1
  let result = (Mes)+"/"+
  Dia+"/"+date.getFullYear();
  return result;
}
 export const IniciaAtendimento=async (Atendmento)=>{
  let Codigo =await MaxCodigoMovAtend();
  let data =new Date();
  let NewDate =FormatDateSQLServer(data);
  let SQL =`insert Into Movatend(Codigo,Cliente,Vendedor,DataInicio,planoPGTO,Status,TotalBruto,NrMesa)`
  SQL+=`Values(${Codigo},${1},${Atendmento.Vendedor},'${NewDate}',${1},'P',0,${Atendmento.NroMesa})`
 await Executor(SQL)
 return Codigo
//   .then((dados) => {
//     return Codigo;
//   }).catch((err) => {GravarLog(err)
//     console.error('Erro no Inicia Atendimento'+err);
//   })

}
export const AnalisaStatusAtendimento=async(NrMesa)=>{
 //Retorno Sera P ou C
  let SQL= "Select Ltrim(Rtrim(status)) as Estado from MovAtend Where NrMesa = "+NrMesa+ " and status='P'" 
 return await Executor(SQL)
  .then((dados) => {
    if(dados.length==0)
    return false;
    else
    return true
  }).catch((err) => { GravarLog(err)
    console.error(err);
  })
 
}
 export const InsereMovAtende=async (Atendimento)=>{
 let Estado = await AnalisaStatusAtendimento(Atendimento.NroMesa)

 if(Estado===false){
         return await  IniciaAtendimento(Atendimento)
    

 }
 else{
         return await  PegaCodgoDoAtendimentoAtual(Atendimento)
 }

}
const verificaSeItemJaExiste=async(Iten)=>{

let SQL = 'Select CodIten from MovAtendItens where Codigo ='+Iten.CodAtend+' and CodIten='+Iten.Codigo
let result  = await Executor(SQL)
.then((dados) => {  

 //console.log('O item ja foi lancado para este atendimento',dados)

 return dados.recordset

}).catch((err) => { GravarLog(err)
  console.error('Erro na pesquisa do  Iten'+err);
})


if( result.length > 0){
  return true;
}

return false;

}

const AtualizaTotalMovAtend =async (Codigo)=>{
let SQL=`Select sum(VlTotal) as Total from MovAtendItens where Codigo =${Codigo}`
let SQL1 =``
await Executor(SQL)
.then((dados) => {

    if(undefined!= dados) {

       SQL1=`Update MovAtend Set TotalBruto ='${dados.recordset[0].Total}' where Codigo = ${Codigo}`
      Executor(SQL1)
       .then(console.log("Atualizou o totalBruto de  MovAtend"))
       .catch(err=>console.log("Deu erro na Atualizacao",err));

    }


}).catch((err) => { 
  console.error('Erro no Insere Iten'+err);
  //GravarLog(err);
})
}

export const InsereItensMovAtend=async(Itens)=>{
let teste =await  verificaSeItemJaExiste(Itens).then(D=>{return D});
let SQL=``;
let Tp =``;
console.log('valor de teste ='+ teste);
 // if(teste== false){
    let TotalB = Math.round(Itens.qtd * Itens.PrecoVenda,2);
    SQL = `Insert into MovAtendItens(Codigo,CodIten,Desconto,QTD,ValorUN,VlTOTAL)`
    SQL+=`Values(${Itens.CodAtend},${Itens.Codigo},0,${Itens.qtd},'${Itens.PrecoVenda}','${TotalB}')`
    Tp=`Inserido`
  //}
  //  else {
  //   Tp=`Atualizado`
  //   SQL = `Update MovAtendItens set qtd = ${Itens.qtd} where CodIten=${Itens.Codigo} and Codigo =${Itens.CodAtend}`
  //  }
  
  let ret = await Executor(SQL)
  .then(async(dados) => {    
   console.log('dados de itens foram '+ Tp);
   await AtualizaTotalMovAtend(Itens.CodAtend);
   console.log('Atualizando Total MovAtend');
   return '1'
  }).catch((err) => { 
    console.error('Erro no Insere Iten'+err);
    return'0'
    
  })
  return ret;
}
export const RemoveItemMovAtend = async(Param)=>{
  let SQL = 'Delete from MovAtendItens where Cod ='+Param.Cod
  Executor(SQL)
  .then((dados) => {
    console.log('Removido Item');
    return dados
   
  }).catch((err) => { GravarLog(err)
    console.error('Erro ao remover Item'+err);
  })

}
export const AlteraQtdMovAtenItem= async (Param)=>{
 let SQL ='update MovAtendItens set qtd ='+Param.Quantidade+' where Cod='+Param.Cod;

 Executor(SQL)
 .then((dados) => {
   console.log('Alterada Qtd Item');
   return dados
  
 }).catch((err) => { GravarLog(err)
   console.error('Erro ao alterar QTD Item'+err);
 })


}
export const MarcaImpressaoMovAtend =(Param)=>{
  let SQL ='update MovAtend set Imprime = 1 where Codigo='+Param.Codigo;

  Executor(SQL)
  .then((dados) => {
    console.log('Impressao Marcada');
   return dados
  
 }).catch((err) => { GravarLog(err)
   console.error('Erro ao alterar QTD Item'+err);
 })
}
 export const GravaComprador=(Param)=>{
  let SQL ='update Vendas  set Comprador ='+Param.Comprador+' where Codigo='+Param.Codigo;

  Executor(SQL)
  .then((dados) => {
   
    return 200
   
  }).catch((err) => { GravarLog(err)
    console.error('Erro ao alterar QTD Item'+err);
  })

 }
 export const AnalisaEstadoVenda=(Codigo)=>{

     let SQL = `Select Situacao from vendas where Mesa=`+Codigo

   return  Executor(SQL)
  .then((dados) => {
   
        if(dados != undefined){
           let estado= dados.data;
            return estado;
        }
         return false;
   
  }).catch((err) => { GravarLog(err)
    console.error('Erro ao alterar QTD Item'+err);
  })


 }
 export const DeletaItemVenda =async(Param)=>{

   let Codigo =await BuscaCodigoMesaAberto(Param.NroMesa).then(D=>{return D})
   Param.Info.CodigoAtendimento = Codigo;

   await GravaInfoDeletçãoItem(Param.Info)
    .then((e)=>{

      let SQL = `delete from ItensVenda where Cod=${Param.CodProd}`
      return  Executor(SQL)
      .then((dados) => {
       
            if(dados != undefined){
               let estado= dados.data;
                return true;
            }
             return false;
       
      }).catch((err) => { GravarLog(err)
        console.error('Erro ao Deletar Item'+err);
      })  
    }  
    )

    

  }
   export const GravaInfoDeletçãoItem= async(Param)=>{
     
    let codigo = await MaxCodigo("Eventos").then(d=>{return d})
    
    let sql ='insert into Eventos(Codigo,usuario,Tabela,Motivacao)'
    sql+=` values(${codigo},${Param.CodigoUsuario},'ItensVenda','Remoção do item: ${Param.Codigo},VendaCodigo:${Param.CodigoAtendimento}')`
    return  Executor(sql)
    .then((dados) => {
     
          if(dados != undefined){
             let estado= dados.data;
              return true ;
          }
           return false;
     
    }).catch((err) => { GravarLog(err)
      console.error('Erro ao alterar QTD Item'+err);
    })
  }

   const AnalisaExistenciaDeItens=async(Mesa)=>{
     let Codigo =await BuscaCodigoMesaAberto(Mesa).then(d=>{return d})

     let SQL =` select count(I.Codigo) as Contagem from itensVenda I inner join Vendas V on V.Codigo = I.Codigo where I.Codigo=${Codigo}  and V.situacao='P'`;
       if(Codigo!=0 & Codigo!= undefined){
        return await Executor(SQL)
        .then((dados) => {
         
              if(dados != undefined){
                 let estado= dados[0].Contagem;
                  if(estado >0)
                  return true ;
                  else{
                    return false;
                  }
              }
               return false;
         
        }).catch((err) => { GravarLog(err)
          console.error('Erro ao alterar QTD Item'+err);
          return false;
        })
       }
       else
       return false;
    
  }
  function CriaTabelasTreinoIA(){
    let Questions  = ` if not exists(select Name from sys.tables where name='Questions') `
    Questions+=` Begin`;
    Questions+=` Create Table Questions(Codigo int primary key identity(1,1),Question varchar(500),intent varchar(50),Lingua varchar(5) )`
    Questions+=` End`

    let Respostas =`if Not Exists(select Name from sys.tables where name='Answer')`
    Respostas+=` Begin `
    Respostas+=` Create table Answer(Codigo int primary key identity(1,1)   FOREIGN KEY (Codigo) References Questions(Codigo),intent varchar(50),Answer varchar(550),Lingua varchar(5))`
    Respostas+=` End `

    Executor(Questions).then(r=>{console.log("O resultado Foi da criação da tab Questions ",r)})
    .catch(err=>{console.error("Deu Pau na Criacao da tabela Questions",err)});

    Executor(Respostas).then(r=>{console.log("O resultado Foi da criação da tab Respostas ",r)})
    .catch(err=>{console.error("Deu Pau na criacao da tabela Answer",err)});
  }

  async function InsertQuestions(Text){
    let Question=`Insert Into Questions(Question,intent,lingua)`
    Question+=` Values('${Text.Question}','${Text.intent}','${Text.lingua}')`

   return await Executor(Question).then(Resp=>{ console.log("Inset Question Result:",Resp);return true;})
    .catch(err=>{Console.error("Insert Question Error:",error);return false})
  }

  async function InsertAnswer(Text){
    let Answer=`Insert Into Answer( Answer,intent,lingua)`
    Answer=` Values('${Text.answer}','${Text.intent}','${Text.lingua}')`

       return await Executor(Answer).then(Resp=>{console.log('Insert Answer Result:',Resp);return true})
       .catch(err=>{console.error("Insert Answer ERROR:",err);return false;})
  }

  async function ListQuestions(){

    let Answer =`Select * from Questions`;

    return await  Executor(Answer).then(D=>{return D}).catch(err=>{console.log('Selecion Error Question',err);return false});
  }

  async function ListAnswers(){

    let Questions = `Select * from Answer`;

      return await Executor(Questions).then(d=>{return d}).catch(err=>{console.log('Selection ERROR Answer')});
  }

  async function CalculaNPCompleto(){
    //calculaValorDefinido();
   return Calcula.Calcula();
  }