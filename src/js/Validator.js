import { ListaProdutos,ListarMesas,ValidaSenha,ValidaUsuario,ListarProdutosComEstoque, IniciaAtendimento, InsereItensMovAtend, InsereMovAtende } from "./Executor.js";
const ConsultaProdutos = async (Text) => {
    const response = await ListaProdutos(Text);
    return JSON.stringify(response);
}
const ValUsuario = async (Usuario) => {
  console.log('Valor recebido em Usuario:', Usuario); // Adicione esta linha
    try {
        let result = await ValidaUsuario(Usuario);
       
        let validou={usuario:false}
         // Cria um objeto para armazenar o resultado da validação
     
         if(result) {
            validou.usuario = true; // Usuário encontrado
         }
      
          
            return JSON.stringify(validou); // Retorna o resultado da validação
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

        return JSON.stringify(validou); // Retorna o resultado da validação
    } catch (error) {
        console.error('Erro ao validar senha:', error);
        throw new Error('Erro ao validar senha');
    }
}
 const login = async (Usuario, Senha) => {
   try {
       let [validacaoUsuario, validacaoSenha] = await Promise.all([
           ValidaUsuario(Usuario),
           ValidaSenha(Senha)
       ]);

       if (validacaoUsuario && validacaoSenha) {
           return { sucesso: true };
       } else {
           return { sucesso: false };
       }
   } catch (error) {
       console.error('Erro ao realizar login:', error);
       throw new Error('Erro ao realizar login');
   }
}
const ListaMesas = async (Text) => {
    let mesas= await ListarMesas(Text);
    return JSON.stringify(mesas);
}
const ProdutosComEstoque = async (Text) => {
    let produtos = await ListarProdutosComEstoque(Text);
    return JSON.stringify(produtos);
}

const IniciaAtend = async (params) => {
    try {
        let atendimento = await InsereMovAtende(params);//verifica e abre a venda
        return JSON.stringify({ CodAtend: atendimento });
    }
    catch (error) {
        console.error('Erro ao iniciar atendimento:', error);
        throw new Error('Erro ao iniciar atendimento');
    }
}
const InsereItens=(params)=>{
    let ret = InsereItensMovAtend(params);
    return ret
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
            let D = await ValUsuario(params.Message);
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
        default:
            return 'Unknown validation type';
    }
};

export default Addresser;