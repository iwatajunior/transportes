import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import api from '../services/api';
import senacLogo from '../Senac_logo.png';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!email) {
            setError('Por favor, insira seu email.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage('Se o email estiver cadastrado, você receberá um link para redefinir sua senha.');
            
            // Redireciona para a página de login após 5 segundos
            setTimeout(() => {
                history.push('/login');
            }, 5000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ocorreu um erro. Tente novamente.';
            setError(errorMessage);
            console.error("Erro ao solicitar redefinição de senha:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box
                    component="img"
                    src={senacLogo}
                    alt="Senac Logo"
                    sx={{ height: 60, mb: 3 }}
                />
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom sx={{
                        fontFamily: "'Exo 2', sans-serif",
                        fontWeight: 'bold',
                        color: 'primary.main'
                    }}>
                        Recuperação de Senha
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Digite seu email cadastrado para receber um link de redefinição de senha.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                        id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                            error={!!error}
                    />

                        {message && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {message}
                            </Alert>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Enviar Link de Redefinição'
                            )}
                        </Button>

                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => history.push('/login')}
                            sx={{ mt: 1 }}
                        >
                            Voltar para o Login
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default ForgotPasswordPage;
