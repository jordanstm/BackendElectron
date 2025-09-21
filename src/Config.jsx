import React, { useState, useEffect } from 'react';
import modelosDeContexto from './ModelosDeContexto.mjs';

const BotConfigurator = () => {
    const [contexto, setContexto] = useState('');
    const [arquivos, setArquivos] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [modeloSelecionado, setModeloSelecionado] = useState('');
    const [servidorOllama, setServidorOllama] = useState('http://localhost:11434');
    const [modeloContextoSelecionado, setModeloContextoSelecionado] = useState('');
    const [modelosCustomizados, setModelosCustomizados] = useState([]);
    const [novoModeloNome, setNovoModeloNome] = useState('');
    const [novoModeloTexto, setNovoModeloTexto] = useState('');

useEffect(() => {
  const configSalva = localStorage.getItem('configBotIA');
  if (configSalva) {
    try {
      const config = JSON.parse(configSalva);

      setContexto(config.contexto || '');
      setServidorOllama(config.servidorOllama || 'http://localhost:11434');
      setModeloSelecionado(config.modeloSelecionado || '');

      // Restaurar arquivos (apenas nomes, sem conteúdo real)
      if (Array.isArray(config.arquivos)) {
        const arquivosCarregados = config.arquivos.map(a => ({
          file: { name: a.caminho },
          nomePersonalizado: a.nome
        }));
        setArquivos(arquivosCarregados);
      }

      // Verifica se o contexto corresponde a algum modelo
      const todosModelos = [...modelosDeContexto, ...modelosCustomizados];
      const modeloEncontrado = todosModelos.find(m => m.texto === config.contexto);
      if (modeloEncontrado) {
        setModeloContextoSelecionado(modeloEncontrado.nome);
      }

    } catch (err) {
      console.error('Erro ao carregar configuração:', err);
    }
  }
}, []);


  useEffect(() => {
    if (!servidorOllama) return;

    fetch(`${servidorOllama}/api/tags`)
      .then(res => res.json())
      .then(data => {
        const nomes = data.models.map(m => m.name);
        setModelos(nomes);
      })
      .catch(err => {
        console.error('Erro ao buscar modelos:', err);
        setModelos([]);
      });
  }, [servidorOllama]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const novosArquivos = files.map(file => ({
      file,
      nomePersonalizado: ''
    }));
    setArquivos(prev => [...prev, ...novosArquivos]);
  };

  const handleNomeChange = (index, nome) => {
    const atualizados = [...arquivos];
    atualizados[index].nomePersonalizado = nome;
    setArquivos(atualizados);
  };

 const salvarConfiguracoes = () => {
  const config = {
    contexto, // apenas o texto final
    servidorOllama,
    modeloSelecionado,
    arquivos: arquivos.map(a => ({
      nome: a.nomePersonalizado || a.file.name,
      caminho: a.file.name
    }))
  };
  localStorage.setItem('configBotIA', JSON.stringify(config));

  console.log('Configuração JSON:', JSON.stringify(config, null, 2));
};

  return (
    <div style={{
      padding: '30px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#1e1e1e',
      color: '#f0f0f0',
      borderRadius: '12px',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }}>
      <h2 style={{ marginBottom: '20px' }}>🛠️ Configuração do BotIA</h2>

      {/* Servidor Ollama */}
      <div style={{ marginBottom: '20px' }}>
        <label>🔗 Caminho do servidor Ollama:</label>
        <input
          type="text"
          value={servidorOllama}
          onChange={e => setServidorOllama(e.target.value)}
          placeholder="http://localhost:11434"
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '5px',
            borderRadius: '6px',
            border: '1px solid #555',
            backgroundColor: '#2a2a2a',
            color: '#fff'
          }}
        />
      </div>

      {/* Modelo Ollama */}
      <div style={{ marginBottom: '20px' }}>
        <label>🧠 Modelo Ollama:</label>
        <select
          value={modeloSelecionado}
          onChange={e => setModeloSelecionado(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '5px',
            borderRadius: '6px',
            border: '1px solid #555',
            backgroundColor: '#2a2a2a',
            color: '#fff'
          }}
        >
          <option value="">Selecione um modelo</option>
          {modelos.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Contexto Inicial */}
      {/* Seleção de modelo predefinido */}
<div style={{ marginBottom: '20px' }}>
  <label>🎭 Escolher modelo de contexto:</label>
  <select
    value={modeloContextoSelecionado}
    onChange={e => {
      const nome = e.target.value;
      setModeloContextoSelecionado(nome);
      const modelo = [...modelosDeContexto, ...modelosCustomizados].find(m => m.nome === nome);
      if (modelo) setContexto(modelo.texto);
    }}
    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
  >
    <option value="">Selecione um modelo</option>
    {[...modelosDeContexto, ...modelosCustomizados].map((m, i) => (
      <option key={i} value={m.nome}>{m.nome}</option>
    ))}
  </select>
</div>

{/* Criar novo modelo */}
<div style={{ marginBottom: '20px' }}>
  <label>➕ Criar novo modelo:</label>
  <input
    type="text"
    placeholder="Nome do modelo"
    value={novoModeloNome}
    onChange={e => setNovoModeloNome(e.target.value)}
    style={{ width: '100%', marginBottom: '5px' }}
  />
  <textarea
    rows={4}
    placeholder="Texto do modelo"
    value={novoModeloTexto}
    onChange={e => setNovoModeloTexto(e.target.value)}
    style={{ width: '100%' }}
  />
  <button
    onClick={() => {
      if (novoModeloNome && novoModeloTexto) {
        setModelosCustomizados(prev => [...prev, { nome: novoModeloNome, texto: novoModeloTexto }]);
        setNovoModeloNome('');
        setNovoModeloTexto('');
      }
    }}
    style={{ marginTop: '10px' }}
  >
    💾 Adicionar modelo
  </button>
</div>


      {/* Upload de Arquivos */}
      <div style={{ marginBottom: '20px' }}>
        <label>📁 Selecionar Arquivos:</label>
        <input type="file" multiple onChange={handleFileChange} style={{ marginTop: '5px' }} />

        {arquivos.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            {arquivos.map((a, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <span style={{ display: 'block', marginBottom: '4px' }}>{a.file.name}</span>
                <input
                  type="text"
                  placeholder="Nome personalizado"
                  value={a.nomePersonalizado}
                  onChange={e => handleNomeChange(i, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid #555',
                    backgroundColor: '#2a2a2a',
                    color: '#fff'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão de salvar */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={salvarConfiguracoes}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007acc',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          💾 Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default BotConfigurator;
