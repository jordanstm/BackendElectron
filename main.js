//const { app, BrowserWindow, Tray, Menu,ipcMain} = require('electron');
import { app, BrowserWindow, Tray, Menu,ipcMain} from 'electron';
//const path = require('path');
import path from 'path';
//const express = require('express');
import express from 'express';
//const http = require('http');
import http from 'http';
//const socketIo = require('socket.io');
import {Server as socketIo}  from 'socket.io';
//const Executor = require('./src/js/Executor.js');
import { Executor } from './src/js/Executor.js';

import { fileURLToPath } from 'url';
import Addresser from './src/js/Validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let icone;
let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname,'src','js', 'preload.js')
    },
    icon: path.join(__dirname, 'src', 'images', 'logofull.png')
  });
  mainWindow.loadFile('index.html');
  mainWindow.hide();
  //Executor.TestaConexao();
  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }

    return false;
  });
}

app.on('ready', function () {
  createWindow();
  icone = path.join(__dirname, 'src', 'images', 'logofull.png');
  tray = new Tray(icone);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Exibir Conector',
      click: function () {
        mainWindow.show();
      },
    },
    {
      label: 'Fechar',
      click: function () {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('A&C');
  tray.setContextMenu(contextMenu);

  tray.on('click', function () {
    mainWindow.show();
    mainWindow.focus();
  });

  // Inicie o servidor Express
  const expressApp = express();
  const apiServer = http.createServer(expressApp);
  const socketServer = http.createServer();
  const io =new socketIo( socketServer);

  // Configuração do servidor de API
  expressApp.get('', (req, res) => {
    res.send('API funcionando!');
  });
  // Endpoint para download do APK
  expressApp.get('/download', (req, res) => {
    const filePath = path.join(__dirname, 'download', 'AC.apk');
    res.download(filePath, 'aplicativo.apk', (err) => {
      if (err) {
        res.end();
        
      }
    });
  });
  //Consulta produtos pelo endpoint Express
 expressApp.get('/Produtos', (req, res) => {
  try{
     let Result= Executor.ListaProdutos(  (req.body))
      if(Result){
        res.json(Result)
      }
  }
  catch(e){
    console.error(e);
    res.status(500).send('Erro interno');
  }
   
   })
        

  io.on('connection', (socket) => {
    
    mainWindow.webContents.send('cliente-conectado', `Novo cliente conectado: ${socket.id}`)

    console.log(`Novo cliente conectado: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
     
    });

    socket.on('message',async(message,callback)=>{
       let identfier = JSON.parse(message)
        
            let Message = identfier.message;
            let route = identfier.route;           
            let resp = await Addresser({ Message, route })

      console.log("os dados da variavel re,", resp)
      mainWindow.webContents.send('Retorno', `Dados: ${JSON.stringify(resp)}`)
      callback(JSON.parse(JSON.stringify(resp )))
      
            
    }) 
  });
  
  //Consulta produtos por socket
  io.on('SendMessage', (message)=>{
    console.log('Mensagem recebida:', message);
  Executor.ListaProdutos(message).then(re=>{
   
   io.emit('ReceiveMessage',re )
  }).
  catch(err=>{
    
  })
        
  })

  // Configuração do servidor de sockets
  
  apiServer.listen(8099, () => {
    console.log('Servidor de API rodando na porta 8099');
  });

  socketServer.listen(8091, () => {
    console.log('Servidor de sockets rodando na porta 8091');
  });

  ipcMain.on('renderer-ready', (event) => {
    // Pode ser usado para enviar dados iniciais ao renderizador
    event.sender.send('cliente-conectado', 'Renderizador pronto');
  });

 })
  


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
