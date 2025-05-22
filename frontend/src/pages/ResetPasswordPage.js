import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom'; // Para pegar o token da URL e para navegação (v5)
// Certifique-se de ter react-router-dom instalado: npm install react-router-dom ou yarn add react-router-dom
import axios from 'axios';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
    LinearProgress
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ResetPasswordPage = () => {
    const { token } = useParams(); // Pega o token da URL
    const history = useHistory();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        if (!token) {
            setError('Token de redefinição não fornecido ou inválido.');
            // Opcionalmente, redirecionar para a página de login ou forgot-password
            // history.push('/login');
        }
    }, [token, history]);

    useEffect(() => {
        // Calcula a força da senha
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[a-z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        setPasswordStrength(strength);
    }, [password]);

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 25) return 'error';
        if (passwordStrength <= 50) return 'warning';
        if (passwordStrength <= 75) return 'info';
        return 'success';
    };

    const validatePassword = () => {
        if (password.length < 8) {
            return 'A senha deve ter pelo menos 8 caracteres';
        }
        if (!password.match(/[A-Z]/)) {
            return 'A senha deve conter pelo menos uma letra maiúscula';
        }
        if (!password.match(/[a-z]/)) {
            return 'A senha deve conter pelo menos uma letra minúscula';
        }
        if (!password.match(/[0-9]/)) {
            return 'A senha deve conter pelo menos um número';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const passwordError = validatePassword();
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (!confirmPassword) {
            setError('Por favor, confirme sua senha.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            // Adapte a URL da API conforme necessário
            const response = await axios.post(`/api/v1/auth/reset-password/${token}`, { senha: password });
            setMessage(response.data.message || 'Sua senha foi redefinida com sucesso!');
            // Opcional: redirecionar para a página de login após um breve delay
            setTimeout(() => {
                history.push('/login'); // Ajuste a rota de login conforme sua configuração
            }, 3000);
        } catch (err) {
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Ocorreu um erro ao redefinir sua senha. O token pode ser inválido ou ter expirado.';
            setError(errorMessage);
            console.error("Erro ao redefinir senha:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ mt: 8, textAlign: 'center' }}>
                    <Alert severity="error">
                        O link de redefinição de senha é inválido ou expirou.
                    </Alert>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => history.push('/forgot-password')}
                        sx={{ mt: 2 }}
                    >
                        Solicitar novo link
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <LockResetIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                        <Typography component="h1" variant="h5">
                            Redefinir Senha
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Nova Senha"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={!!error && error.includes('senha')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {password && (
                            <Box sx={{ mt: 1, mb: 2 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={passwordStrength} 
                                    color={getPasswordStrengthColor()}
                                />
                                <Typography variant="caption" color="textSecondary">
                                    Força da senha: {passwordStrength}%
                                </Typography>
                            </Box>
                        )}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirmar Nova Senha"
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={!!error && error.includes('senhas não coincidem')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
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
                            disabled={loading || passwordStrength < 75}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Redefinir Senha'
                            )}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default ResetPasswordPage;
