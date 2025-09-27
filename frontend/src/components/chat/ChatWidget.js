// frontend/src/components/chat/ChatWidget.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Badge, Fab, Paper, Typography, IconButton, TextField, Divider, CircularProgress } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { getChatSocket } from '../../services/chatSocket';

const ChatWidget = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [input, setInput] = useState('');
  const listRef = useRef(null);
  const socket = useMemo(() => getChatSocket(), []);

  const userId = user?.userId || user?.userid || user?.sub || null;
  const userName = user?.nome || user?.name || 'Usuário';

  const scrollToBottom = () => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    if (!open) return;
    setConnecting(true);
    // Attach auth payload (token already set in service) and connect
    const token = localStorage.getItem('token') || '';
    const userRole = String(user?.perfil || user?.role || '').toLowerCase();
    socket.auth = { token, userId, userName, userRole };
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      // Load history
      socket.emit('chat:history', { limit: 50 }, (resp) => {
        if (resp?.ok) {
          setMessages(resp.data || []);
          setTimeout(scrollToBottom, 50);
        }
        setConnecting(false);
      });
    };
    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!open) setUnread((c) => c + 1);
      setTimeout(scrollToBottom, 50);
    };
    socket.on('connect', onConnect);
    socket.on('chat:message', onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('chat:message', onMessage);
      // Mantém a conexão viva para receber notificações mesmo minimizado
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId, userName]);

  const handleToggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) setUnread(0);
      return next;
    });
  };

  const handleSend = () => {
    const text = (input || '').trim();
    if (!text) return;
    socket.emit('chat:message', { message: text }, (resp) => {
      if (!resp?.ok) {
        console.error('Falha ao enviar mensagem:', resp?.error);
      }
    });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Box sx={{ position: 'fixed', right: 16, bottom: 32, zIndex: 1300 }}>
        <Badge color="error" badgeContent={unread} invisible={unread === 0 || open} overlap="circular">
          <Fab
            color="primary"
            variant="extended"
            size="small"
            onClick={handleToggle}
            aria-label="Fale com a COTRAN"
            sx={{ px: 1.5, py: 0.5, minHeight: 32 }}
          >
            <SupportAgentIcon sx={{ mr: 0.75, fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Fale com a COTRAN</Typography>
          </Fab>
        </Badge>
      </Box>

      {/* Panel */}
      {open && (
        <Paper elevation={6} sx={{ position: 'fixed', right: 16, bottom: 86, width: { xs: 280, sm: 380 }, height: 260, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', zIndex: 1300 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', px: 1, py: 0.75 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupportAgentIcon />
              Fale com a COTRAN
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'inherit' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', p: 0.75, bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fafafa' : 'background.default') }}>
            {connecting && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="caption" sx={{ ml: 1 }}>Conectando…</Typography>
              </Box>
            )}
            {messages.map((m) => {
              const mine = m.user_id === userId;
              return (
                <Box key={m.id || `${m.user_id}-${m.created_at}-${Math.random()}`} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', mb: 0.5 }}>
                  <Box sx={{ px: 0.75, py: 0.5, borderRadius: 1.5, maxWidth: '78%', bgcolor: mine ? 'primary.light' : 'grey.200', color: mine ? 'primary.contrastText' : 'text.primary' }}>
                    {!mine && (
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>{m.user_name || 'Usuário'}</Typography>
                    )}
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.message}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7 }}>
                      {new Date(m.created_at).toLocaleString('pt-BR')}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Divider />
          <Box sx={{ p: 0.75, display: 'flex', gap: 0.75 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Digite sua mensagem…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <IconButton color="primary" onClick={handleSend} aria-label="Enviar">
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatWidget;
