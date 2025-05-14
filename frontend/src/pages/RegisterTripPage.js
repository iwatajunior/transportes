import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Alert } from '@mui/material';
import TripForm from '../components/trips/TripForm'; // Criaremos este componente em breve
import api from '../services/api'; // Seu wrapper do Axios

const RegisterTripPage = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegisterTrip = async (tripData) => {
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
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
                    mb: 4
                }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom 
                        sx={{ 
                            fontFamily: "'Exo 2', sans-serif",
                            color: theme => theme.palette.primary.main,
                            fontWeight: 600,
                            mb: 1
                        }}
                    >
                        Registrar Nova Viagem
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            color: theme => theme.palette.text.secondary,
                            textAlign: 'center',
                            maxWidth: 600
                        }}
                    >
                        Preencha os detalhes da viagem abaixo. Todos os campos marcados com * são obrigatórios.
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
