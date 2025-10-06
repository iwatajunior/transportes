// frontend/src/pages/SupportChatDesk.js
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper, Typography, List, ListItemButton, ListItemText, Divider, Avatar, ListItemAvatar } from '@mui/material';
import { keyframes } from '@mui/system';
import SupportChatWindow from '../components/chat/SupportChatWindow';
import { getChatSocket } from '../services/chatSocket';
import api from '../services/api';
import { resolvePhotoUrl, withCacheBuster } from '../utils/photoUrl';

const SupportChatDesk = () => {
  const socket = useMemo(() => getChatSocket(), []);
  const [activeUsers, setActiveUsers] = useState([]); // [{ userId, userName }]
  // windows: { [userId]: { name, loading, messages: [], unread: number, active: boolean } }
  const [windows, setWindows] = useState({});
  const [connected, setConnected] = useState(false);
  const [listUnread, setListUnread] = useState({}); // { [userId]: number }
  const [listBlink, setListBlink] = useState({}); // { [userId]: boolean }
  const [userPhotos, setUserPhotos] = useState({}); // { [userId]: resolvedPhotoUrl }

  const blinkAnim = keyframes`
    0% { background-color: transparent; }
    50% { background-color: var(--blink-color, rgba(25, 118, 210, 0.32)); }
    100% { background-color: transparent; }
  `;

  const palette = [
    'rgba(25, 118, 210, 0.32)',  // blue
    'rgba(46, 125, 50, 0.32)',   // green
    'rgba(211, 47, 47, 0.32)',   // red
    'rgba(123, 31, 162, 0.32)',  // purple
    'rgba(255, 143, 0, 0.32)',   // orange
    'rgba(0, 121, 107, 0.32)',   // teal
  ];
  const colorForUser = (id) => {
    try {
      const s = String(id);
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return palette[h % palette.length];
    } catch {
      return palette[0];
    }
  };

  // Ensure we connect as support
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    // Derivar papel do token (fallback para administrador)
    let role = 'administrador';
    let supportName = 'Suporte';
    let supportId = null;
    try {
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        role = String(payload.perfil || payload.role || 'administrador').toLowerCase();
        supportName = payload.nome || payload.name || 'Suporte';
        supportId = payload.userId || payload.userid || payload.sub || null;
      }
    } catch {}
    socket.auth = { token, userRole: role, userName: supportName, userId: supportId };
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setConnected(true);
    };
    const onActiveUsers = (list) => {
      setActiveUsers(list || []);
    };
    const onMessage = (msg) => {
      const uid = msg.user_id;
      if (!uid) return;
      setWindows((prev) => {
        const w = { ...prev };
        if (!w[uid]) return prev; // message for a window not opened yet
        const wasActive = !!w[uid].active;
        const fromSupport = !!msg.is_support;
        const nextUnread = wasActive ? 0 : (w[uid].unread || 0) + 1;
        // Always blink on new user message, regardless of active state
        const nextBlink = !fromSupport ? true : !!w[uid].blink;
        w[uid] = { ...w[uid], messages: [...(w[uid].messages || []), msg], loading: false, unread: nextUnread, blink: nextBlink };
        return w;
      });
      // Only bump list unread if no window or window is not active
      setListUnread((prev) => {
        const win = windows[uid];
        const shouldCount = !win || !win.active;
        return shouldCount ? { ...prev, [uid]: (prev[uid] || 0) + 1 } : prev;
      });
      // Blink the corresponding list item on any user message and keep until support replies
      if (!msg.is_support) {
        setListBlink((prev) => ({ ...prev, [uid]: true }));
      }
    };

    socket.on('connect', onConnect);
    socket.on('chat:active_users', onActiveUsers);
    socket.on('chat:message', onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('chat:active_users', onActiveUsers);
      socket.off('chat:message', onMessage);
    };
  }, [socket]);

  // Fetch photos for active users (best-effort). Uses /api/v1/users and maps by userid.
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        if (!Array.isArray(activeUsers) || activeUsers.length === 0) return;
        // Skip if we already have all photos
        const missing = activeUsers.filter(u => !userPhotos[u.userId]);
        if (missing.length === 0) return;
        const resp = await api.get('/users');
        const list = resp?.data || [];
        const map = {};
        for (const u of list) {
          const id = u.userid ?? u.userId ?? u.id;
          if (id == null) continue;
          const raw = u.fotoperfilurl;
          const resolved = raw ? resolvePhotoUrl(String(raw)) : null;
          if (resolved) map[String(id)] = resolved;
        }
        if (Object.keys(map).length > 0) {
          setUserPhotos(prev => ({ ...prev, ...map }));
        }
      } catch (e) {
        // silent fail; fallback to initials
        // console.warn('[SupportChatDesk] loadPhotos error', e?.message || e);
      }
    };
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUsers]);

  const openWindow = (userId, userName) => {
    setWindows((prev) => {
      if (prev[userId]) return prev;
      return { ...prev, [userId]: { name: userName, loading: true, messages: [], unread: 0, active: true, blink: false } };
    });
    // Reset list unread for this user when opening
    setListUnread((prev) => ({ ...prev, [userId]: 0 }));
    setListBlink((prev) => ({ ...prev, [userId]: false }));
    // Load history for that user
    socket.emit('chat:history', { userId, limit: 50 }, (resp) => {
      if (resp?.ok) {
        setWindows((prev) => ({
          ...prev,
          [userId]: { name: userName, loading: false, messages: resp.data || [], unread: 0, active: true, blink: false }
        }));
      } else {
        setWindows((prev) => ({
          ...prev,
          [userId]: { name: userName, loading: false, messages: prev[userId]?.messages || [], unread: 0, active: true, blink: false }
        }));
      }
    });
  };

  const closeWindow = (userId) => {
    setWindows((prev) => {
      const w = { ...prev };
      delete w[userId];
      return w;
    });
  };

  const sendMessage = (toUserId, text) => {
    socket.emit('chat:message', { toUserId, message: text }, (resp) => {
      if (!resp?.ok) {
        // opcional: feedback de erro
        // eslint-disable-next-line no-console
        console.error('[SupportChatDesk] sendMessage error', resp?.error);
      }
    });
    // Ativar janela (resetar unread)
    setWindows((prev) => ({
      ...prev,
      [toUserId]: { ...prev[toUserId], active: true, unread: 0, blink: false }
    }));
    // Limpar blink na lista ao responder
    setListBlink((prev) => ({ ...prev, [toUserId]: false }));
  };

  const activateWindow = (userId) => {
    setWindows((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], active: true, unread: 0, blink: false }
    }));
    setListUnread((prev) => ({ ...prev, [userId]: 0 }));
  };

  return (
    <>
    <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Suporte COTRAM</Typography>
          <Typography variant="body2" color="text.secondary">
            Clique no usuário ativo para interagir.
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(2px)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span>Usuários ativos</span>
              <Box component="span" sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}> {(activeUsers||[]).length} </Box>
            </Typography>
            <List dense sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
              {(activeUsers || []).length === 0 && (
                <Typography variant="caption" color="text.secondary">Nenhum usuário ativo no momento.</Typography>
              )}
              {(activeUsers || []).map((u) => {
                const name = u.userName || `Usuário ${u.userId}`;
                const initials = String(name).trim().split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase();
                const unread = listUnread[u.userId] || 0;
                return (
                  <ListItemButton
                    key={u.userId}
                    onClick={() => openWindow(u.userId, name)}
                    sx={{
                      animation: listBlink[u.userId] ? `${blinkAnim} 0.6s ease-in-out infinite` : 'none',
                      '--blink-color': colorForUser(u.userId),
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={withCacheBuster(userPhotos[String(u.userId)]) || undefined} sx={{ width: 44, height: 44, fontSize: 16 }}>
                        {(!userPhotos[String(u.userId)]) ? (initials || 'U') : null}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>}
                      secondary={<Typography variant="caption" color="text.secondary">ID: {u.userId}</Typography>}
                    />
                    {unread > 0 && (
                      <Box sx={{ ml: 1, minWidth: 18, px: 0.75, py: 0.25, borderRadius: 2, bgcolor: 'error.main', color: 'error.contrastText', textAlign: 'center', fontSize: 11, fontWeight: 700 }}>
                        {unread}
                      </Box>
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {Object.entries(windows).length === 0 && (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">Nenhuma janela aberta. Selecione um usuário na lista ao lado.</Typography>
              </Paper>
            )}
            {Object.entries(windows).map(([uid, w]) => (
              <SupportChatWindow
                key={uid}
                userId={uid}
                userName={w.name}
                messages={w.messages}
                loading={w.loading}
                unreadCount={w.unread || 0}
                blink={!!w.blink}
                onClose={closeWindow}
                onSend={sendMessage}
                onActivate={activateWindow}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
    </>
  );
};

export default SupportChatDesk;
