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
    auth: {
      token: token || '',
    },
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

export const connectChatSocket = () => {
  const s = getChatSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectChatSocket = () => {
  if (socket && socket.connected) socket.disconnect();
};
