// frontend/src/services/chatSocket.js
import { io } from 'socket.io-client';

let socket = null;

export const getChatSocket = () => {
  if (socket) return socket;
  const token = localStorage.getItem('token');
  // Resolve backend URL: prefer env, else use page hostname (LAN-friendly), fallback localhost
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
  const URL = process.env.REACT_APP_BACKEND_URL || `http://${host}:3001`;
  socket = io(URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    auth: buildAuthFromToken(token),
  });
  // Basic diagnostics
  socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[chatSocket] connect_error:', err?.message);
  });
  socket.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[chatSocket] error:', err);
  });
  return socket;
};

function buildAuthFromToken(token) {
  const auth = { token: token || '' };
  try {
    if (!token) return auth;
    const payload = decodeJwt(token);
    // Try different fields commonly used across the app/backend
    const userId = payload?.userId ?? payload?.userid ?? payload?.id ?? null;
    const userName = payload?.nome ?? payload?.name ?? payload?.email ?? 'Usuário';
    const roleRaw = payload?.perfil ?? payload?.role ?? '';
    const role = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : '';
    auth.userId = userId;
    auth.userName = userName;
    auth.userRole = role;
  } catch {}
  return auth;
}

function decodeJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  return JSON.parse(jsonPayload);
}

export const connectChatSocket = () => {
  const s = getChatSocket();
  // Refresh auth before connect (in case token changed)
  try {
    const token = localStorage.getItem('token');
    s.auth = buildAuthFromToken(token);
  } catch {}
  if (!s.connected) s.connect();
  return s;
};

export const disconnectChatSocket = () => {
  if (socket && socket.connected) socket.disconnect();
};
