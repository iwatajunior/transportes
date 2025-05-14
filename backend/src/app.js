// src/app.js (ou server.js)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Ou especifique suas origens permitidas, e.g., 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Configuração do Helmet com CSP para reCAPTCHA (TEMPORARIAMENTE DESABILITADA PARA DIAGNÓSTICO)
/*
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://www.google.com", "https://www.gstatic.com"],
      "frame-src": ["'self'", "https://www.google.com", "https://www.gstatic.com"],
      "style-src": ["'self'", "https://www.google.com", "https://www.gstatic.com", "'unsafe-inline'"],
      // Adicione outras diretivas conforme necessário para sua aplicação
      // Exemplo: style-src, img-src, etc.
    },
  })
);
*/
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'uploads' na rota '/uploads'
const path = require('path');
const fs = require('fs');

// Configurar o diretório de uploads como estático
const uploadsDir = path.join(__dirname, '../uploads');
console.log('DEBUG - Servindo arquivos estáticos de:', uploadsDir);

// Garantir que o diretório existe
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir os arquivos estáticos
app.use('/uploads', express.static(uploadsDir));

app.get('/health-check', (req, res) => {
  console.log('Health check endpoint was hit!'); // Log para ver se chega aqui
  res.status(200).send('Backend is alive and kicking!');
});

// Rotas Principais (Exemplo)
app.get('/api/v1/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do Sistema de Transportes!' });
});

// TODO: Importar e usar rotas de autenticação, usuários, viagens, veículos, etc.
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes'); // <-- Nova importação
const tripRoutes = require('./routes/tripRoutes');
const userRoutes = require('./routes/userRoutes'); // <-- Importação das rotas de usuário
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes); // <-- Novas rotas de veículos
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/users', userRoutes); // <-- Uso das rotas de usuário

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
