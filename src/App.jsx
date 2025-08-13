

import React, { useDebugValue, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import logo from './images/logofull.png';


function App({ darkMode, toggleTheme }) {
  const [qrCode, setQrCode] = useState(null);
    const [clientes, setClientes] = useState([]);
  useEffect(() => {
  const fetchQr = async () => {
    const res = await fetch('http://localhost:8099/qr');
    const text = await res.text();
    const match = text.match(/<img src="([^"]+)"/);
    if (match) {
      setQrCode(match[1]);
    } else {
      setQrCode(1);
    }
  };

  fetchQr();

  const handleClienteConectado = ( message) => {
    console.log("Cliente conectado:", message);
    setClientes((prev) => [...prev, message]);
  };

  if (window.electron && window.electron.ipcRenderer) {
    console.log("IPC Renderer  disponível");
    window.electron.ipcRenderer.on('cliente-conectado', handleClienteConectado);
  } else {
    console.log("IPC Renderer não está disponível");
  }

  const interval = setInterval(fetchQr, 5000);

  return () => {
    clearInterval(interval);
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.removeListener('cliente-conectado', handleClienteConectado);
    }
  };
}, []);


  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
        {/* Botão de alternância de tema */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Tooltip title="Alternar tema">
            <IconButton onClick={toggleTheme} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Logo */}
        <Box mb={2}>
          <img src={logo} alt="Logo Ultrasoft" style={{ width: 120 }} />
        </Box>

        {/* Título e instruções */}
        <Typography variant="h5" gutterBottom>
          Conecte-se ao WhatsApp
        </Typography>
        { qrCode === null &&  <Typography variant="body1" gutterBottom>
          Escaneie o QR Code abaixo com seu aplicativo WhatsApp.
        </Typography>
        }
       

        {/* QR Code ou loading */}
      <Box mt={3}>
  {qrCode === null && <CircularProgress />}
  {qrCode === 1 && <Typography variant="body1">Aparelho conectado no WhatsApp</Typography>}
  {qrCode && qrCode !== 1 && (
    <img src={qrCode} alt="QR Code" style={{ width: 300 }} />
  )}
</Box>
        <Box>
          {
            clientes.length>0 && (
              <Box mt={2}>
                <Typography variant="h6">Clientes Conectados:</Typography>
                <ul>
                  {clientes.map((cliente, index) => (
                    <li key={index}>{cliente}</li>
                  ))}
                </ul>
              </Box>
            )
          }
        </Box>
      </Paper>
    </Container>
  );
}

export default App;
