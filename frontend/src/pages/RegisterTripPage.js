import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TripForm from '../components/trips/TripForm'; // Criaremos este componente em breve
import api from '../services/api'; // Seu wrapper do Axios
import { useAuth } from '../contexts/AuthContext';

const RegisterTripPage = () => {
    const { user } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegisterTrip = async (tripData) => {
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            // Pré-validação: checar avaliações pendentes do usuário
            try {
                const myId = user?.userId;
                const tripsResp = await api.get('/trips?scope=home');
                const myConcluded = (tripsResp.data || []).filter((t) => 
                    String(t.status_viagem || '').toLowerCase() === 'concluida' &&
                    Number(t.solicitante_usuarioid) === Number(myId)
                );
                if (myConcluded.length > 0) {
                    const evalResp = await api.get('/evaluations');
                    const all = evalResp.data?.evaluations || evalResp.data || [];
                    const myEvalsByTrip = new Set(
                        (all || [])
                            .filter((e) => String(e.user_id) === String(myId))
                            .map((e) => String(e.tripid))
                    );
                    const hasPending = myConcluded.some((t) => !myEvalsByTrip.has(String(t.tripid)));
                    if (hasPending) {
                        setError(
                            <span>
                                Antes de solicitar uma nova viagem, é necessário avaliar sua última experiência. Acesse
                                {' '}<RouterLink to="/minhasviagens">Minhas Viagens</RouterLink>{' '}e conclua a avaliação.
                            </span>
                        );
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (e) {
                // Em caso de erro na checagem, não bloquear o fluxo de registro
            }

            const response = await api.post('/trips', tripData);
            setSuccess('Viagem registrada com sucesso! ID da Viagem: ' + response.data.trip.viagemid);
            setIsLoading(false);
            setTimeout(() => {
                setSuccess('');
            }, 5000); // Aumentar o tempo de visualização da mensagem de sucesso
        } catch (err) {
            setIsLoading(false);
            const errorMessage = err.response?.data?.details || err.response?.data?.message || 'Erro ao registrar viagem. Tente novamente.';
            setError(errorMessage);
            console.error("Erro ao registrar viagem:", err.response?.data || err.message);
        }
    };

    return (
        <Box sx={{
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            overflowX: 'hidden',
            backgroundColor: theme => theme.palette.background.default,
            py: 3
        }}>
            <Container 
                maxWidth="lg" 
                sx={{ 
                    px: { xs: 1, sm: 2, md: 3 },
                    mx: 'auto'
                }}
            >
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: { xs: 2, sm: 3 },
                        backgroundColor: '#fff',
                        borderRadius: 2,
                        width: '100%',
                        boxSizing: 'border-box'
                    }}
                >
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <Typography 
                        variant="h5" 
                        component="h1" 
                        gutterBottom 
                        sx={{ 
                            fontFamily: "'Exo 2', sans-serif",
                            color: theme => theme.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '1.5rem'
                        }}
                    >
                        Registrar Nova Viagem
                    </Typography>
                </Box>

                {(error || success) && (
                    <Box sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
                        {error && (
                            <Alert 
                                severity="error" 
                                sx={{ 
                                    mb: 2,
                                    '& .MuiAlert-message': { fontSize: '1rem' }
                                }}
                            >
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert 
                                severity="success"
                                sx={{ 
                                    mb: 2,
                                    '& .MuiAlert-message': { fontSize: '1rem' }
                                }}
                            >
                                {success}
                            </Alert>
                        )}
                    </Box>
                )}
                
                <Box sx={{ 
                    maxWidth: '100%',
                    mx: 'auto',
                    backgroundColor: '#fff',
                    p: { xs: 1, sm: 2 }
                }}>
                    <TripForm
                        onSubmit={handleRegisterTrip}
                        isLoading={isLoading}
                    />
                </Box>
            </Paper>
        </Container>
        </Box>
    );
};

export default RegisterTripPage;
