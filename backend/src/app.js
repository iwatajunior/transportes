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
const settingsRoutes = require('./routes/settingsRoutes'); // <-- Importação das rotas de configurações (nota)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes); // <-- Novas rotas de veículos
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/users', userRoutes); // <-- Uso das rotas de usuário
app.use('/api/v1/routes', routeRoutes); // <-- Uso das rotas de rotas
app.use('/api/v1/materials', materialRoutes); // <-- Uso das rotas de materiais
app.use('/api/v1/caronas', caronasRoutes); // <-- Uso das rotas de caronas
app.use('/api/v1/evaluations', evaluationsRoutes); // <-- Uso das rotas de avaliações
app.use('/api/v1/settings', settingsRoutes); // <-- Uso das rotas de configurações (nota)

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
// Expor io para uso em controllers via req.app.get('io')
app.set('io', io);
// Track active users: Map<userId, { name, count }>
const activeUsers = new Map();

// Chat model and routes
const { createTableIfNotExists, insertMessage, fetchMessages } = require('./models/chatModel');
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/v1/chat', chatRoutes);

// Initialize chat table
createTableIfNotExists().then(() => {
  console.log('[chat] chat_messages table is ready');
}).catch(err => console.error('[chat] init table error', err));

// Simple auth middleware on socket (reads token and profile from auth)
io.use((socket, next) => {
  const auth = socket.handshake.auth || {};
  const token = auth.token || '';
  const userId = auth.userId || null;
  const userName = auth.userName || 'Usuário';
  const userRole = String(auth.userRole || '').toLowerCase();
  socket.user = { token, userId, userName, userRole };
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
  const { userId, userName, userRole } = socket.user;
  const isSupport = userRole === 'gestor' || userRole === 'administrador' || userRole === 'admin';
  // Build a stable identity key for presence and rooms
  const idKey = (userId !== null && typeof userId !== 'undefined') ? String(userId) : `sid:${socket.id}`;

  // Join appropriate rooms
  if (isSupport) {
    socket.join('support');
    // Send current active users to this support agent
    const list = Array.from(activeUsers.entries()).map(([id, v]) => ({ userId: id, userName: v.name }));
    socket.emit('chat:active_users', list);
  } else {
    // Join by numeric userId when present, otherwise by socket.id key
    const room = (userId !== null && typeof userId !== 'undefined') ? `user:${userId}` : `user:${socket.id}`;
    socket.join(room);
    // Track presence (increase connection count) by idKey
    const prev = activeUsers.get(idKey) || { name: userName, count: 0, numericUserId: (userId ?? null) };
    activeUsers.set(idKey, { name: userName || prev.name, count: prev.count + 1, numericUserId: (userId ?? prev.numericUserId ?? null) });
    const list = Array.from(activeUsers.entries()).map(([id, v]) => ({ userId: id, userName: v.name }));
    io.to('support').emit('chat:active_users', list);
  }
  // History on demand (support can request a specific user; regular user gets own history)
  socket.on('chat:history', async ({ limit = 50, before, userId: targetUserId } = {}, cb) => {
    try {
      let queryUserId = null;
      if (isSupport && (typeof targetUserId !== 'undefined')) {
        // When target is a sid key, we cannot query by numeric user_id
        if (typeof targetUserId === 'string' && targetUserId.startsWith('sid:')) {
          queryUserId = null;
        } else {
          const parsed = Number(targetUserId);
          queryUserId = Number.isFinite(parsed) ? parsed : null;
        }
      } else if (!isSupport && userId) {
        queryUserId = userId;
      }
      const data = await fetchMessages({ limit, before, userId: queryUserId });
      cb && cb({ ok: true, data });
    } catch (e) {
      cb && cb({ ok: false, error: e.message });
    }
  });

  // New message (support must target a user; user messages are tied to their own userId)
  socket.on('chat:message', async ({ message, toUserId }, cb) => {
    try {
      if (!message || !String(message).trim()) {
        cb && cb({ ok: false, error: 'Mensagem vazia' });
        return;
      }
      let saved;
      if (isSupport) {
        const target = toUserId;
        if (typeof target === 'undefined' || target === null) {
          cb && cb({ ok: false, error: 'toUserId é obrigatório para mensagens do suporte' });
          return;
        }
        // Determine delivery room and numeric user id for DB
        let deliverRoom;
        let numericUserId = null;
        if (typeof target === 'string' && target.startsWith('sid:')) {
          const sid = target.slice(4);
          deliverRoom = `user:${sid}`;
          numericUserId = null;
        } else {
          const parsed = Number(target);
          if (!Number.isFinite(parsed)) {
            cb && cb({ ok: false, error: 'toUserId inválido' });
            return;
          }
          numericUserId = parsed;
          deliverRoom = `user:${parsed}`;
        }
        saved = await insertMessage({ user_id: numericUserId, user_name: userName, message, is_support: true });
        io.to(deliverRoom).emit('chat:message', saved);
        io.to('support').emit('chat:message', saved);
      } else {
        // Regular user message
        saved = await insertMessage({ user_id: userId || null, user_name: userName, message, is_support: false });
        // Deliver to this user's room and to support room
        const room = (userId !== null && typeof userId !== 'undefined') ? `user:${userId}` : `user:${socket.id}`;
        io.to(room).emit('chat:message', saved);
        io.to('support').emit('chat:message', saved);
      }
      cb && cb({ ok: true });
    } catch (e) {
      cb && cb({ ok: false, error: e.message });
    }
  });

  socket.on('chat:typing', ({ toUserId } = {}) => {
    if (isSupport && toUserId) {
      socket.to(`user:${toUserId}`).emit('chat:typing', { from: 'support', toUserId });
    } else if (!isSupport && userId) {
      socket.to('support').emit('chat:typing', { from: userId });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnect', reason);
    // Update presence
    if (!isSupport) {
      const prev = activeUsers.get(idKey);
      if (prev) {
        const nextCount = Math.max(0, (prev.count || 1) - 1);
        if (nextCount === 0) {
          activeUsers.delete(idKey);
        } else {
          activeUsers.set(idKey, { ...prev, count: nextCount });
        }
        const list = Array.from(activeUsers.entries()).map(([id, v]) => ({ userId: id, userName: v.name }));
        io.to('support').emit('chat:active_users', list);
      }
    }
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend rodando em http://0.0.0.0:${PORT} (acessível na rede)`);
});
