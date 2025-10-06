import React, { useState, useEffect, useRef } from 'react';
import { getUserProfile, updateUserProfile } from '../services/api';
import { useHistory } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Avatar,
    CircularProgress,
    Alert,
    Stack,
    Divider,
    IconButton,
    useTheme,
    Badge
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { styled } from '@mui/material/styles';

const Input = styled('input')({ display: 'none' });

const EditProfilePage = () => {
    const theme = useTheme();
    const history = useHistory();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (prop) => (event) => {
        setFormData({ ...formData, [prop]: event.target.value });
        // Limpar mensagens de erro/sucesso quando o usuário começa a digitar
        setError(null);
        setSuccess(null);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await getUserProfile();
                setFormData(prev => ({
                    ...prev,
                    nome: profileData.nome,
                    email: profileData.email
                }));
                
                if (profileData.fotoperfilurl) {
                    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
                    const backendRoot = process.env.REACT_APP_BACKEND_URL || `http://${host}:3001`;
                    const raw = String(profileData.fotoperfilurl).trim();
                    const fullUrl = /^https?:\/\//i.test(raw)
                      ? raw
                      : (raw.startsWith('/') ? `${backendRoot}${raw}` : `${backendRoot}/uploads/${raw}`);
                    setImagePreviewUrl(fullUrl);
                }
                setIsLoading(false);
            } catch (err) {
                setError('Falha ao carregar dados do perfil. ' + (err.response?.data?.message || err.message || ''));
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        const { senha, confirmarSenha } = formData;
        
        // Permite salvar sem senha se estiver apenas alterando a foto
        if (!selectedFile && (!senha || senha.trim() === '')) {
            setError('Forneça uma nova senha ou selecione uma nova foto para alterar.');
            return;
        }

        if (senha !== confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }

        try {
            const formDataToSend = new FormData();
            if (senha) formDataToSend.append('senha', senha);
            if (selectedFile) formDataToSend.append('foto', selectedFile);

            const resp = await updateUserProfile(formDataToSend);
            setSuccess('Perfil atualizado com sucesso!');
            setFormData(prev => ({ ...prev, senha: '', confirmarSenha: '' }));
            setSelectedFile(null);
            // Atualizar imediatamente a foto com base na resposta da API
            try {
                const updated = resp?.user || resp;
                const raw = updated?.fotoperfilurl ? String(updated.fotoperfilurl).trim() : '';
                if (raw) {
                    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
                    const backendRoot = process.env.REACT_APP_BACKEND_URL || `http://${host}:3001`;
                    const resolved = /^https?:\/\//i.test(raw)
                        ? raw
                        : (raw.startsWith('/') ? `${backendRoot}${raw}` : `${backendRoot}/uploads/${raw}`);
                    // Cache-busting para refletir imediatamente
                    const ts = Date.now();
                    const withBuster = `${resolved}${resolved.includes('?') ? '&' : '?'}t=${ts}`;
                    setImagePreviewUrl(withBuster);
                    // Opcional: persistir como cache local
                    try { 
                        localStorage.setItem('profilePhotoUrl', resolved);
                        localStorage.setItem('profilePhotoUpdatedAt', String(ts));
                    } catch {}
                }
            } catch {}
            // Notificar app para recarregar perfil e refletir nova foto (ex.: avatar no header)
            try { window.dispatchEvent(new Event('auth-profile-updated')); } catch {}
        } catch (err) {
            setError('Falha ao atualizar perfil. ' + (err.response?.data?.message || err.message || ''));
        }
    };

    const handleBack = () => {
        history.goBack();
    };

    if (isLoading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ mb: 3 }}>
                    <IconButton 
                        onClick={handleBack}
                        sx={{ mb: 2 }}
                        aria-label="voltar"
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <label htmlFor="icon-button-file">
                                    <Input
                                        accept="image/*"
                                        id="icon-button-file"
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImagePreviewUrl(reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <IconButton
                                        aria-label="upload picture"
                                        component="span"
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: theme.palette.primary.dark,
                                            },
                                            width: 32,
                                            height: 32
                                        }}
                                    >
                                        <AddAPhotoIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </label>
                            }
                        >
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: theme.palette.primary.main
                                }}
                                src={imagePreviewUrl}
                            >
                                {!imagePreviewUrl && <PersonIcon sx={{ fontSize: 40 }} />}
                            </Avatar>
                        </Badge>
                        <Typography variant="h5" component="h1" sx={{ fontFamily: "'Exo 2', sans-serif" }}>
                            Editar Perfil
                        </Typography>
                    </Stack>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            label="Nome"
                            value={formData.nome}
                            disabled
                            fullWidth
                            InputProps={{
                                readOnly: true,
                                startAdornment: <PersonIcon sx={{ mr: 1, color: theme.palette.grey[500] }} />
                            }}
                        />

                        <TextField
                            label="Email"
                            type="email"
                            value={formData.email}
                            disabled
                            fullWidth
                            InputProps={{
                                readOnly: true,
                                startAdornment: <PersonIcon sx={{ mr: 1, color: theme.palette.grey[500] }} />
                            }}
                        />

                        <TextField
                            label="Nova Senha"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.senha}
                            onChange={handleChange('senha')}
                            fullWidth
                            placeholder="Digite para alterar a senha"
                            InputProps={{
                                startAdornment: <LockIcon sx={{ mr: 1, color: theme.palette.grey[500] }} />
                            }}
                        />

                        <TextField
                            label="Confirmar Nova Senha"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmarSenha}
                            onChange={handleChange('confirmarSenha')}
                            fullWidth
                            placeholder="Confirme a nova senha"
                            InputProps={{
                                startAdornment: <LockIcon sx={{ mr: 1, color: theme.palette.grey[500] }} />
                            }}
                        />

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {success}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<SaveIcon />}
                            sx={{ 
                                mt: 2,
                                fontFamily: "'Exo 2', sans-serif",
                                fontWeight: 500
                            }}
                        >
                            Salvar Alterações
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
};

export default EditProfilePage;
