import React, { useState, useRef, useEffect } from 'react';
import { loginUser } from '../services/api';
import { useHistory, useLocation } from 'react-router-dom';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Paper, // Adicionado Paper
    Avatar, // Para o ícone
    Grid, // Adicionado Grid
    Link // Adicionado Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Ícone de cadeado
// import ReCAPTCHA from 'react-google-recaptcha';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); // Embora não usado para mensagem persistente aqui, mantido por consistência
    const [loading, setLoading] = useState(false);
    // const recaptchaRef = useRef(null);

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const history = useHistory();
    const location = useLocation();

    const performLogin = async () => {
        console.log('performLogin: Tentando login'); // DEBUG
        setError(null);
        setSuccess(null);
        setLoading(true); // setLoading para true aqui

        try {
            console.log('[Frontend Login] performLogin: Tentando login com email:', email); // LOG
            const userData = await loginUser({ email, senha });
            console.log('[Frontend Login] performLogin: Login API call returned. UserData:', userData); // LOG

            if (!userData || !userData.token) {
                console.error('[Frontend Login] ERRO: userData ou userData.token está faltando após loginUser!');
                if (isMountedRef.current) {
                    setError('Falha ao receber token do servidor.');
                    setLoading(false);
                }
                return;
            }
            console.log('performLogin: Login bem-sucedido'); // DEBUG
            localStorage.setItem('token', userData.token);
            console.log('[Frontend Login] Token salvo no localStorage.'); // LOG

            if (onLoginSuccess) {
                console.log('[Frontend Login] Chamando onLoginSuccess com userData:', userData); // LOG
                onLoginSuccess(userData);
            }
            
            const navigatedFromLogout = location.state?.navigatedFromLogout;
            let finalRedirectPath = "/viagens"; 

            if (navigatedFromLogout) {
                finalRedirectPath = "/viagens";
            } else if (location.state?.from?.pathname && location.state.from.pathname !== '/') {
                finalRedirectPath = location.state.from.pathname;
            }
            
            history.push(finalRedirectPath);
            console.log('[Frontend Login] Redirecionado para:', finalRedirectPath); //LOG

        } catch (err) {
            console.error('[Frontend Login] performLogin: Erro no bloco catch do login:', err); // LOG
            const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido ao fazer login.';
            console.error('performLogin: Erro no login:', errorMessage, err); // DEBUG
            if (isMountedRef.current) {
                setError(errorMessage);
            }
        } finally {
            console.log('performLogin: Finalizando...'); // DEBUG
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (event) => {
        console.log('handleSubmit: Iniciado'); // DEBUG
        event.preventDefault();
        performLogin(); 
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ fontFamily: "'Exo 2', sans-serif" }}>
                    Acesse o sistema
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Endereço de Email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        sx={{ mb: 1 }} 
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Senha"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        disabled={loading}
                        sx={{ mt: 1, mb: 2 }} 
                    />
                    {/* Bloco do ReCAPTCHA comentado 
                    <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LeZszIrAAAAAKkUj0GZy654gXjV2TsqNzjtAZRR"} 
                            size="invisible"
                            onChange={handleRecaptchaChange} // Será chamado com o token após execute()
                            onExpired={() => {
                                console.log("ReCAPTCHA: onExpired chamado"); // DEBUG
                                console.log("reCAPTCHA token expirado");
                                setError('Sessão do reCAPTCHA expirada. Tente novamente.');
                                setLoading(false); 
                                if (recaptchaRef.current) {
                                   recaptchaRef.current.reset();
                                }
                            }}
                            onErrored={() => {
                                console.error("ReCAPTCHA: onErrored chamado"); // DEBUG
                                setError('Falha ao carregar o reCAPTCHA. Verifique sua conexão ou tente recarregar a página.');
                                setLoading(false); 
                                if (recaptchaRef.current) {
                                   recaptchaRef.current.reset();
                                }
                            }}
                            hl="pt-BR" 
                        />
                    </Box>
                    */}
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 0, mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {/* A mensagem de sucesso é geralmente transitória e tratada pelo redirecionamento
                    {success && (
                        <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
                            {success}
                        </Alert>
                    )} 
                    */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2, mb: 2, fontFamily: "'Exo 2', sans-serif", fontSize: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                    </Button>
                </Box>
            </Paper>
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Grid item>
                    <Link href="/forgot-password" variant="body2">
                        Esqueceu a senha?
                    </Link>
                </Grid>
            </Grid>
        </Container>
    );
};

export default LoginPage;
