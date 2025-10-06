// frontend/src/components/chat/ChatWidget.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Badge, Fab, Paper, Typography, IconButton, TextField, Divider, CircularProgress, Select, MenuItem } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { getChatSocket, disconnectChatSocket } from '../../services/chatSocket';

const ChatWidget = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [input, setInput] = useState('');
  const [activeUsersList, setActiveUsersList] = useState([]); // [{ userId, userName }]
  const [targetUserId, setTargetUserId] = useState(''); // string or number
  const listRef = useRef(null);
  const socket = useMemo(() => getChatSocket(), []);

  const userId = user?.userId || user?.userid || user?.sub || null;
  const userName = user?.nome || user?.name || 'Usuário';
  const isSupport = String(user?.perfil || user?.role || '').toLowerCase().includes('admin') || String(user?.perfil || user?.role || '').toLowerCase().includes('gestor');

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
    let role = String(user?.perfil || user?.role || '').toLowerCase();
    let uid = userId;
    let uname = userName;
    try {
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        uid = uid || payload.userId || payload.userid || payload.sub || payload.id || null;
        uname = uname || payload.nome || payload.name || 'Usuário';
        role = String(role || payload.perfil || payload.role || '').toLowerCase();
      }
    } catch {}
    socket.auth = { token, userId: uid, userName: uname, userRole: role };
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setConnected(true);
      // Load history
      socket.emit('chat:history', { limit: 50 }, (resp) => {
        if (resp?.ok) {
          setMessages(resp.data || []);
          setTimeout(scrollToBottom, 50);
        }
        setConnecting(false);
      });
    };
    const onDisconnect = () => {
      setConnected(false);
      setConnecting(false);
    };
    const onConnectError = () => {
      setConnected(false);
      setConnecting(false);
    };
    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!open) setUnread((c) => c + 1);
      setTimeout(scrollToBottom, 50);
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('chat:message', onMessage);
    const onActiveUsers = (list) => {
      // list: [{ userId, userName }]
      setActiveUsersList(Array.isArray(list) ? list : []);
      // Auto-select first if none selected
      if (isSupport && (!targetUserId || targetUserId === '')) {
        const first = (Array.isArray(list) && list[0]) ? list[0].userId : '';
        setTargetUserId(first || '');
      }
    };
    socket.on('chat:active_users', onActiveUsers);

    // If already connected (due to login auto-connect), trigger history
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('chat:message', onMessage);
      socket.off('chat:active_users', onActiveUsers);
      // Ao desmontar (ex.: logout), desconectar para limpar presença no servidor
      try { disconnectChatSocket(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId, userName]);

  // When support selects a different user, refetch history for that user
  useEffect(() => {
    if (!open || !isSupport) return;
    if (!socket || !socket.connected) return;
    setConnecting(true);
    socket.emit('chat:history', { limit: 50, userId: targetUserId }, (resp) => {
      if (resp?.ok) {
        setMessages(resp.data || []);
        setTimeout(scrollToBottom, 50);
      }
      setConnecting(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

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
    const payload = isSupport ? { message: text, toUserId: targetUserId } : { message: text };
    if (isSupport && (!targetUserId || targetUserId === '')) {
      console.warn('[chat] Nenhum usuário selecionado para envio (suporte)');
      return;
    }
    socket.emit('chat:message', payload, (resp) => {
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
            aria-label="Fale com a COTRAM"
            sx={{ px: 1.5, py: 0.5, minHeight: 32 }}
          >
            <SupportAgentIcon sx={{ mr: 0.75, fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Fale com a COTRAM</Typography>
          </Fab>
        </Badge>
      </Box>

      {/* Panel */}
      {open && (
        <Paper elevation={6} sx={{ position: 'fixed', right: 16, bottom: 86, width: { xs: 280, sm: 380 }, height: 340, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', zIndex: 1300 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', px: 1, py: 0.75 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SupportAgentIcon />
                Fale com a COTRAM
              </Typography>
              <Box sx={{ ml: 0.5, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: connected ? 'success.main' : (connecting ? 'warning.main' : 'error.main'), color: 'common.white', fontSize: 10, fontWeight: 700 }}>
                {connected ? 'Conectado' : (connecting ? 'Conectando…' : 'Offline')}
              </Box>
              {isSupport && (
                <Box sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, px: 0.5 }}>
                  <Select
                    size="small"
                    value={targetUserId || ''}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    displayEmpty
                    sx={{ color: 'primary.contrastText', '& .MuiSelect-icon': { color: 'primary.contrastText' }, minWidth: 140 }}
                    inputProps={{ 'aria-label': 'Selecionar usuário' }}
                  >
                    <MenuItem value=""><em>Selecionar usuário…</em></MenuItem>
                    {activeUsersList.map((u) => (
                      <MenuItem key={String(u.userId)} value={u.userId}>{u.userName || u.userId}</MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
            </Box>
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
            {(!connecting && !connected) && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1.25 }}>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>Sem conexão com o chat.</Typography>
              </Box>
            )}
            {messages.map((m) => {
              const fromSupport = !!m.is_support;
              // Determine 'mine' properly for both roles
              let mine = false;
              if (isSupport) {
                // Suporte: minhas mensagens têm is_support=true e meu nome como user_name
                mine = fromSupport && (String(m.user_name || '') === String(userName || ''));
              } else {
                // Usuário: minhas mensagens têm is_support=false e, se possível, user_id igual ao meu id
                const myNumericId = (typeof userId === 'number') ? userId : (Number(userId));
                if (Number.isFinite(myNumericId)) {
                  mine = !fromSupport && (Number(m.user_id) === myNumericId);
                } else {
                  mine = !fromSupport;
                }
              }
              return (
                <Box key={m.id || `${m.user_id}-${m.created_at}-${Math.random()}`} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', mb: 0.5 }}>
                  <Box sx={{ px: 0.75, py: 0.5, borderRadius: 1.5, maxWidth: '78%', bgcolor: mine ? 'primary.light' : 'grey.200', color: mine ? 'primary.contrastText' : 'text.primary' }}>
                    {(!mine && fromSupport) && (
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>{m.user_name || 'Suporte'}</Typography>
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
          <Box sx={{ p: 0.75, display: 'flex', gap: 0.75, alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={isSupport && (!targetUserId || targetUserId==='') ? 'Selecione um usuário para enviar…' : 'Digite sua mensagem…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!connected || (isSupport && (!targetUserId || targetUserId===''))}
            />
            <IconButton color="primary" onClick={handleSend} aria-label="Enviar" disabled={!connected || (isSupport && (!targetUserId || targetUserId===''))}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatWidget;
