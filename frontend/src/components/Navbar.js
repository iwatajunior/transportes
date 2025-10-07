// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { IconButton, Menu, MenuItem, Avatar, Box, Tooltip, Divider, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import './Navbar.css';
import { resolvePhotoUrl, withCacheBuster } from '../utils/photoUrl';
import api from '../services/api';
import { getChatSocket } from '../services/chatSocket';

const Navbar = ({ onLogout, userRole, userName, userPhotoUrl }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [verOpen, setVerOpen] = useState(false);
    const history = useHistory();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditProfile = () => {
        history.push('/editar-perfil');
        handleMenuClose();
    };

    const handleLogout = () => {
        onLogout();
        handleMenuClose();
        // O redirecionamento após o logout geralmente é tratado em App.js ou onde onLogout é definido
    };

    // Versão do app (frontend) - dinâmica via localStorage override
    const getAppVersion = () => {
        try {
            const ls = (localStorage.getItem('appVersion') || '').trim();
            if (ls) return ls;
        } catch {}
        return (process.env.REACT_APP_VERSION || process.env.REACT_APP_BUILD || '').trim() || 'v1.0.0';
    };
    const [appVerTick, setAppVerTick] = useState(0);
    const appVersion = getAppVersion();
    const appNotes = (() => {
        try { return localStorage.getItem('appVersionNotes') || ''; } catch { return ''; }
    })();
    const handleOpenVersion = () => setVerOpen(true);
    const handleCloseVersion = () => setVerOpen(false);

    // Forçar re-render quando a foto de perfil for atualizada
    const [photoVersion, setPhotoVersion] = useState(0);
    useEffect(() => {
        const onProfileUpdated = () => setPhotoVersion((v) => v + 1);
        const onStorage = (e) => {
            if (e.key === 'profilePhotoUpdatedAt') setPhotoVersion((v) => v + 1);
        };
        window.addEventListener('auth-profile-updated', onProfileUpdated);
        window.addEventListener('storage', onStorage);
        const onAppVer = () => setAppVerTick((v)=>v+1);
        window.addEventListener('app-version-updated', onAppVer);
        // Fetch current version from backend (fallback) on mount
        (async () => {
            try {
                const r = await api.get('/settings/version');
                const v = (r?.data?.app_version || '').trim();
                const n = r?.data?.app_version_notes || '';
                if (v) {
                    try { localStorage.setItem('appVersion', v); } catch {}
                }
                try { localStorage.setItem('appVersionNotes', n); } catch {}
                onAppVer();
            } catch {}
        })();
        // Subscribe to socket event for real-time updates
        try {
            const s = getChatSocket();
            const onVer = (payload) => {
                const v = (payload?.app_version || '').trim();
                const n = payload?.app_version_notes || '';
                try { localStorage.setItem('appVersion', v); } catch {}
                try { localStorage.setItem('appVersionNotes', n); } catch {}
                try { window.dispatchEvent(new Event('app-version-updated')); } catch {}
            };
            s.on && s.on('settings:version_updated', onVer);
            return () => {
                window.removeEventListener('auth-profile-updated', onProfileUpdated);
                window.removeEventListener('storage', onStorage);
                window.removeEventListener('app-version-updated', onAppVer);
                try { s.off && s.off('settings:version_updated', onVer); } catch {}
            };
        } catch {
            return () => {
                window.removeEventListener('auth-profile-updated', onProfileUpdated);
                window.removeEventListener('storage', onStorage);
                window.removeEventListener('app-version-updated', onAppVer);
            };
        }
    }, []);


    return (
        <nav className="navbar-mui" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left: Home + Version */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} to="/" color="inherit" aria-label="home" sx={{ mr: 0.5 }}>
                    <HomeIcon />
                </IconButton>
                <Tooltip title={`Versão do sistema: ${appVersion}`}>
                    <IconButton color="inherit" aria-label="versão" onClick={handleOpenVersion} size="small" sx={{ opacity: 0.85, ml: 0.25 }}>
                        <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Dialog open={verOpen} onClose={handleCloseVersion} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ fontFamily: "'Exo 2', sans-serif" }}>Sobre o sistema:</DialogTitle>
                    <DialogContent dividers sx={{ minHeight: 80 }}>
                        <Typography variant="body2"><strong>Versão:</strong> {appVersion}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                            <strong>Desenvolvido por:</strong> Coord. de Sistemas de Informação
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{appNotes || '—'}</Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseVersion} autoFocus>Fechar</Button>
                    </DialogActions>
                </Dialog>
            </Box>

            {/* Right: Account */}
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="Configurações da conta">
                    <IconButton
                        onClick={handleMenuOpen}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                    >
                        {console.log('DEBUG - Avatar Props:', { userName, userPhotoUrl, photoVersion })}
                        <Avatar
                            src={(() => {
                                try {
                                    const preview = localStorage.getItem('profilePhotoPreviewDataUrl');
                                    if (preview) return preview;
                                    const raw = (localStorage.getItem('profilePhotoUrl') || userPhotoUrl || '').trim();
                                    if (!raw) return '';
                                    const resolved = resolvePhotoUrl(raw);
                                    return withCacheBuster(resolved);
                                } catch {
                                    return '';
                                }
                            })()}
                            alt={userName ? userName.charAt(0).toUpperCase() : 'U'}
                            sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '1rem', fontFamily: "'Exo 2', sans-serif" }}
                            imgProps={{
                                onError: (e) => {
                                    console.error('DEBUG - Erro ao carregar imagem. URL completa:', e.target.src);
                                    console.error('DEBUG - URL original:', userPhotoUrl);
                                    e.target.src = '';
                                }
                            }}
                        >
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            fontFamily: "'Exo 2', sans-serif",
                            '& .MuiAvatar-root': { width: 40, height: 40, ml: -0.5, mr: 1 },
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={handleEditProfile} sx={{ fontFamily: "'Exo 2', sans-serif" }}>
                        <EditIcon sx={{ mr: 1 }} /> Editar Perfil
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ fontFamily: "'Exo 2', sans-serif", color: 'error.main' }}>
                        <LogoutIcon sx={{ mr: 1 }} /> Logoff
                    </MenuItem>
                </Menu>
            </Box>
        </nav>
    );
};

export default Navbar;
