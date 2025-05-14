import React, { useState, useEffect } from 'react';
import UserForm from '../components/users/UserForm';
import api from '../services/api';
import { useHistory } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Alert,
    Collapse // Para animação do Alert
} from '@mui/material';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const CreateUserPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const history = useHistory();

    useEffect(() => {
        let timer;
        if (successMessage) {
            setShowSuccess(true);
            timer = setTimeout(() => {
                setShowSuccess(false);
                setSuccessMessage(''); // Limpa a mensagem para não reaparecer
                history.push('/admin/users'); // Redireciona após a mensagem sumir
            }, 5000); // Tempo para a mensagem de sucesso e redirecionamento
        }
        return () => clearTimeout(timer);
    }, [successMessage, history]);

    useEffect(() => {
        if (error) {
            setShowError(true);
            // Não definir timer para erro, ele persiste até nova ação
        } else {
            setShowError(false);
        }
    }, [error]);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setError('');
        setSuccessMessage(''); 
        setShowError(false); // Esconde erro anterior ao tentar novamente
        setShowSuccess(false);
        const token = getAuthToken();

        if (!token) {
            setError('Erro de autenticação. Faça login novamente.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post('/users/register', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setSuccessMessage('Usuário criado com sucesso! ID: ' + response.data.user.userid);
            // O useEffect cuidará do redirecionamento após a mensagem de sucesso

        } catch (err) {
            console.error("Erro ao criar usuário:", err);
            let errorMessage = 'Falha ao criar usuário. Verifique os dados e tente novamente.';
            if (err.response && err.response.data) {
                const apiError = err.response.data;
                if (apiError.errors && Array.isArray(apiError.errors)) {
                    errorMessage = apiError.errors.map(e => `${e.field || 'Campo'}: ${e.message}`).join('; ');
                } else if (apiError.message) {
                    errorMessage = apiError.message;
                }
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: "'Exo 2', sans-serif", textAlign: 'center' }}>
                    Criar Novo Usuário
                </Typography>

                <Box sx={{ mt: 2, mb: 2, minHeight: '70px' /* Espaço para o Alert */ }}>
                    <Collapse in={showError}>
                        <Alert 
                            severity="error" 
                            onClose={() => {setError(''); setShowError(false);}}
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Alert>
                    </Collapse>
                    <Collapse in={showSuccess}>
                        <Alert 
                            severity="success" 
                            onClose={() => {setSuccessMessage(''); setShowSuccess(false);}}
                            sx={{ mb: 2 }}
                        >
                            {successMessage}
                        </Alert>
                    </Collapse>
                </Box>
                
                <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
            </Paper>
        </Container>
    );
};

export default CreateUserPage;
