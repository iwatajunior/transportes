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
const routeRoutes = require('./routes/routeRoutes'); // <-- Importação das rotas de rotas
const materialRoutes = require('./routes/materialRoutes'); // <-- Importação das rotas de materiais
const caronasRoutes = require('./routes/caronasRoutes'); // <-- Importação das rotas de caronas
const evaluationsRoutes = require('./routes/evaluationsRoutes'); // <-- Importação das rotas de avaliações
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes); // <-- Novas rotas de veículos
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/users', userRoutes); // <-- Uso das rotas de usuário
app.use('/api/v1/routes', routeRoutes); // <-- Uso das rotas de rotas
app.use('/api/v1/materials', materialRoutes); // <-- Uso das rotas de materiais
app.use('/api/v1/caronas', caronasRoutes); // <-- Uso das rotas de caronas
app.use('/api/v1/evaluations', evaluationsRoutes); // <-- Uso das rotas de avaliações

// --- Socket.IO setup ---
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET','POST']
  }
});

// Chat model and routes
const { createTableIfNotExists, insertMessage, fetchMessages } = require('./models/chatModel');
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/v1/chat', chatRoutes);

// Initialize chat table
createTableIfNotExists().then(() => {
  console.log('[chat] chat_messages table is ready');
}).catch(err => console.error('[chat] init table error', err));

// Simple auth middleware on socket (reads token from auth)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || '';
  socket.user = { token }; // TODO: validate JWT if required
  next();
});

io.on('connection', (socket) => {
  try {
    const addr = socket.handshake.address;
    const auth = socket.handshake.auth || {};
    console.log('[socket] connection from', addr, 'auth:', { userId: auth.userId, userName: auth.userName, userRole: auth.userRole ? String(auth.userRole) : undefined });
  } catch (e) {
    console.warn('[socket] connection log error', e.message);
  }
  // History on demand
  socket.on('chat:history', async ({ limit = 50, before } = {}, cb) => {
    try {
      const data = await fetchMessages({ limit, before });
      cb && cb({ ok: true, data });
    } catch (e) {
      cb && cb({ ok: false, error: e.message });
    }
  });

  // New message
  socket.on('chat:message', async ({ message }, cb) => {
    try {
      const userName = socket.handshake.auth?.userName || 'Usuário';
      const userId = socket.handshake.auth?.userId || null;
      const userRole = String(socket.handshake.auth?.userRole || '').toLowerCase();
      const isSupport = userRole === 'gestor';
      const saved = await insertMessage({ user_id: userId, user_name: userName, message, is_support: isSupport });
      io.emit('chat:message', saved);
      cb && cb({ ok: true });
    } catch (e) {
      cb && cb({ ok: false, error: e.message });
    }
  });

  socket.on('chat:typing', (payload) => {
    socket.broadcast.emit('chat:typing', payload);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnect', reason);
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend rodando em http://0.0.0.0:${PORT} (acessível na rede)`);
});
