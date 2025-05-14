// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { IconButton, Menu, MenuItem, Avatar, Box, Tooltip, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import './Navbar.css';

const Navbar = ({ onLogout, userRole, userName, userPhotoUrl }) => {
    const [anchorEl, setAnchorEl] = useState(null);
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

    return (
        <nav className="navbar-mui" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton component={Link} to="/" color="inherit" aria-label="home" sx={{ marginRight: 1 }}>
                <HomeIcon />
            </IconButton>

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
                        {console.log('DEBUG - Avatar Props:', { userName, userPhotoUrl })}
                        <Avatar 
                            src={userPhotoUrl ? `http://10.1.1.42:3001${userPhotoUrl}` : ''}
                            alt={userName ? userName.charAt(0).toUpperCase() : 'U'}
                            sx={{ 
                                width: 32, 
                                height: 32,
                                bgcolor: 'secondary.main',
                                fontSize: '1rem',
                                fontFamily: "'Exo 2', sans-serif"
                            }}
                            imgProps={{
                                onError: (e) => {
                                    console.error('DEBUG - Erro ao carregar imagem. URL completa:', e.target.src);
                                    console.error('DEBUG - URL original:', userPhotoUrl);
                                    e.target.src = ''; // Limpa a src para mostrar a letra
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
                            '& .MuiAvatar-root': {
                                width: 40,
                                height: 40,
                                ml: -0.5,
                                mr: 1,
                            },
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
