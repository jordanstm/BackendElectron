window.electron.ipcRenderer.on('cliente-conectado', (message) => {
    // Cria um novo elemento de lista
    const novoItem = document.createElement('li');
    // Define o texto do novo item como a mensagem recebida
    novoItem.textContent = message;
    // Adiciona o novo item à lista
    document.getElementById('conexoes').appendChild(novoItem);
  });


  //Retorno Consulta
  window.electron.ipcRenderer.on('Retorno',(Menssage)=>{
    console.log(Menssage)
   })
  //Menssagens de erro 
  window.electron.ipcRenderer.on('Erro',(Menssage)=>{
     console.log(Menssage)
    })