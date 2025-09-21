import React, { useEffect, useState,useRef } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Paper,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import logo from './images/logofull.png';
import BotConfigurator from './Config';


function App({ darkMode, toggleTheme }) {
  const [qrCode, setQrCode] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [view, setView] = useState("inicio"); // 👈 controle da tela atual
  const intervalRef = useRef(null);

useEffect(() => {
  const fetchQr = async () => {
    try {
      const res = await fetch('http://localhost:8099/qr');
      const text = await res.text();

      if (text === "NOT_READY") {
        setQrCode(null);
        return;
      }

      const json = JSON.parse(text);

      if (json.status === 'connected') {
        setQrCode(1);
      } else {
        setQrCode(json.QrCode);
      }
    } catch (err) {
      console.error('Erro ao buscar QR:', err.message);
    }
  };

  fetchQr(); // busca inicial

  intervalRef.current = setInterval(fetchQr, 5000); // inicia polling

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, []); // 👈 executa só uma vez

useEffect(() => {
  if (qrCode === 1 && intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
}, [qrCode]); // 👈 observa mudanças no qrCode

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={4} sx={{ p: 2, position: 'relative' }}>
        {/* Botão de alternância de tema */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Tooltip title="Alternar tema">
            <IconButton onClick={toggleTheme} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Logo */}
        <Box textAlign="center" mb={2}>
          <img src={logo} alt="Logo Ultrasoft" style={{ width: 120 }} />
        </Box>

        {/* Botões de navegação */}
        <Box textAlign="center" mb={3} >
          <Button
            variant={view === "inicio" ? "contained" : "outlined"}
            onClick={() => setView("inicio")}
            sx={{ mr: 2 }}
          >
            Início
          </Button>
          <Button
            variant={view === "botIA" ? "contained" : "outlined"}
            onClick={() => setView("botIA")}
          >
            BotIA
          </Button>
        </Box>

        {/* Conteúdo da tela Início */}
        {view === "inicio" && (
          <Box textAlign="center">
            <Typography variant="h5" gutterBottom>
              Conecte-se ao WhatsApp
            </Typography>
            {qrCode === null && (
              <Typography variant="body1" gutterBottom>
                Escaneie o QR Code abaixo com seu aplicativo WhatsApp.
              </Typography>
            )}
            <Box mt={3}>
              {qrCode === null && <CircularProgress />}
              {qrCode === 1 && <Typography variant="body1">Aparelho conectado no WhatsApp</Typography>}
              {qrCode && qrCode !== 1 && (
                <img src={qrCode} alt="QR Code" style={{
                  width: 300,
                  filter: 'contrast(200%) brightness(120%)',
                  borderRadius: 8,
                  boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                }} />
              )}
            </Box>
            {clientes.length > 0 && (
              <Box mt={2}>
                <Typography variant="h6">Clientes Conectados:</Typography>
                <ul>
                  {clientes.map((cliente, index) => (
                    <li key={index}>{cliente}</li>
                  ))}
                </ul>
              </Box>
            )}
          </Box>
        )}

        {/* Conteúdo da tela BotIA */}
        {view === "botIA" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Configuração do BotIA
            </Typography>
            <Typography variant="body1">
              Aqui você poderá configurar o RAG, definir fontes, parâmetros e comportamento do bot.
            </Typography>
            <BotConfigurator />
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App;
