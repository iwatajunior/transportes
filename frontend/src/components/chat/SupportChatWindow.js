// frontend/src/components/chat/SupportChatWindow.js
import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, IconButton, TextField, Divider, CircularProgress, Chip } from '@mui/material';
import { keyframes } from '@mui/system';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

const blinkAnim = keyframes`
  0% { filter: brightness(1); }
  50% { filter: brightness(1.25); }
  100% { filter: brightness(1); }
`;

const SupportChatWindow = ({ userId, userName, messages, loading, unreadCount = 0, minimized = false, blink = false, onClose, onSend, onActivate, onMinimize }) => {
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    const text = (input || '').trim();
    if (!text) return;
    onSend && onSend(userId, text);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper elevation={4} sx={{ width: 360, height: minimized ? 48 : 300, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }} onMouseEnter={() => onActivate && onActivate(userId)}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', px: 1, py: 0.75, animation: blink ? `${blinkAnim} 1s ease-in-out infinite` : 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{userName || `Usuário ${userId}`}</Typography>
          {unreadCount > 0 && (
            <Chip size="small" color="error" label={unreadCount} sx={{ height: 20 }} />
          )}
        </Box>
        <Box>
          <IconButton size="small" onClick={() => onClose && onClose(userId)} sx={{ color: 'inherit' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {minimized ? null : (
        <>
          <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', p: 0.75, bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fafafa' : 'background.default') }}>
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="caption" sx={{ ml: 1 }}>Carregando…</Typography>
              </Box>
            )}
            {(messages || []).map((m) => {
              const fromSupport = !!m.is_support;
              return (
                <Box key={m.id || `${m.user_id}-${m.created_at}-${Math.random()}`} sx={{ display: 'flex', justifyContent: fromSupport ? 'flex-end' : 'flex-start', mb: 0.5 }}>
                  <Box sx={{ px: 0.75, py: 0.5, borderRadius: 1.5, maxWidth: '78%', bgcolor: fromSupport ? 'primary.light' : 'grey.200', color: fromSupport ? 'primary.contrastText' : 'text.primary' }}>
                    {!fromSupport && (
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
          <Box sx={{ p: 0.75, display: 'flex', gap: 0.75 }} onMouseEnter={() => onActivate && onActivate(userId)}>
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
        </>
      )}
    </Paper>
  );
}
;

export default SupportChatWindow;
