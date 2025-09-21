let { ListaProdutos,
    ListarMesas,
    ValidaSenha,
    ValidaUsuario,
    ListarProdutosComEstoque,
    IniciaAtendimento,
    InsereItensMovAtend,
    InsereMovAtende,
    ListaItensLancados,
    RemoveItemMovAtend,
    AlteraQtdMovAtenItem,
    ListaMesasOcupadas
} = require("./Executor.js");
const ConsultaProdutos = async (Text) => {
    const response = await ListaProdutos(Text);
    return JSON.stringify(response);
}
const log = require('electron-log');
const ValUsuario = async (Usuario) => {
  log.info('Valor recebido em Usuario:', Usuario);
    try {
        return ValidaUsuario(Usuario);
       
        // Retorna o resultado da validação
        }
     catch (error) {
        console.error('Erro ao validar usuário:', error);
        throw new Error('Erro ao validar usuário');
    }
}
const ValSenha = async ( Senha) => {
    try {
        let result = await ValidaSenha(Senha);
    
       let validou = {  senha: false };
        if (result) {
            validou.senha = true; // Senha válida
        }
         log.info('Valor recebido em Senha:', Senha);
        return JSON.stringify(validou); // Retorna o resultado da validação
    } catch (error) {
        console.error('Erro ao validar senha:', error);
        throw new Error('Erro ao validar senha');
    }
}
const login = async (Usuario, Senha) => {
    try {

        let senha = await ValidaSenha(Senha)
        let usuario = await ValidaUsuario(Usuario)
        if (usuario && senha) {
            return ({ sucesso: true });
        } else {
            return ({ sucesso: false });
        }
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        throw new Error('Erro ao realizar login');
    }
}
async function ListaMesas  (Text)  {
    try{
       let mesas = await ListarMesas();
   return JSON.stringify(mesas);
    }
    catch (error) {
           
        console.error('Erro ao listar mesas:', error);
    }
    
     
   
}
async function ProdutosComEstoque (Text) {
   return ListarProdutosComEstoque(Text).then(produtos=>{
        return JSON.stringify(produtos);
    });
}

async function IniciaAtend  (params)  {
    try {
        return InsereMovAtende(params).then(atendimento=>{
               return JSON.stringify({ CodAtend: atendimento });
        });//verifica e abre a venda
       
    }
    catch (error) {
        console.error('Erro ao iniciar atendimento:', error);
        throw new Error('Erro ao iniciar atendimento');
    }
}
const InsereItens=async (params)=>{
   let ret = await InsereItensMovAtend(params)
   return ret;
}
const ListaItens =async(params)=>{
  let Itens =await   ListaItensLancados(params)
   if( Itens )
       return JSON.stringify(Itens)
   else
       return 0
}
const RemoveItem =async(params)=>{
    let ret =await RemoveItemMovAtend(params)
    return JSON.stringify(ret)
}
const AlteraQTD = async(params)=>{
    let ret =await  AlteraQtdMovAtenItem(params);
    return JSON.stringify(ret)
}

async function listaMesasOcupadas(params){
   
let mesas=await  ListaMesasOcupadas(params)
  return JSON.stringify(mesas)
}
const Addresser =async(params) => {
 console.log('params:', params);
    switch (params.route) {
        case '/Consulta':
           let A = await ConsultaProdutos(params.message);
           return A ;
        case '/ConsultaProdutos':
           let B= await ConsultaProdutos(params.message);
           return B;
        case '/validaSenha':
            let C = await ValSenha(params.Message);
            return C;
        case '/validaUsuario':
            let D = await ValUsuario(params.Message)           
            return D;
            case '/login':
            let E = await login(params.Message.usuario, params.Message.senha);
            return JSON.stringify(E);
        case '/Mesas':
            let F = await ListaMesas(params.Message);
            return F;
            case '/ProdutosComEstoque':
            let G = await ProdutosComEstoque(params.Message);
            return G;
            case   '/IniciaAtendimento':
            let H = await IniciaAtend(params.Message);
            return H;
        case '/InsereIten':
            let I = await InsereItens(params.Message);
            return JSON.stringify({data:I});
            case'/ListaItensLancados':
            let J = await ListaItens(params.Message)
             return J;
             case'/RemoveItem':
             let K = RemoveItem(params.Message)
             return K;
             case '/AlteraQTDMov':
                let L= AlteraQTD(params.Message)
                  return L;                  
                  case '/ListaMesasOcupadas':
                    let M = await listaMesasOcupadas(params.Message)
                    
                    return M;
        default:
            return 'Unknown validation type';
    }
};

module.exports= Addresser ;