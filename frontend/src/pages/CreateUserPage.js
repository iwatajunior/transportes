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
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Usuário não autenticado');
                history.push('/login');
                return;
            }

            // Verifica campos obrigatórios
            const requiredFields = ['nome', 'email', 'senha', 'perfil'];
            let missingFields;

            if (formData instanceof FormData) {
                missingFields = requiredFields.filter(field => !formData.get(field));
            } else {
                missingFields = requiredFields.filter(field => !formData[field]);
            }

            if (missingFields.length > 0) {
                throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
            }

            let response;

            if (formData instanceof FormData) {
                // Log dos dados que serão enviados
                const formDataEntries = Array.from(formData.entries());
                console.log('Enviando dados (FormData):', {
                    nome: formData.get('nome'),
                    email: formData.get('email'),
                    perfil: formData.get('perfil'),
                    setor: formData.get('setor'),
                    foto: formData.get('foto')?.name,
                    entries: formDataEntries.map(([key, value]) => `${key}: ${value instanceof File ? value.name : value}`)
                });

                // Remove o Content-Type para que o axios configure automaticamente com o boundary correto
                response = await api.post('/users/register', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } else {
                console.log('Enviando dados (JSON):', formData);

                response = await api.post('/users/register', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            
            setSuccessMessage('Usuário criado com sucesso! ID: ' + response.data.user.userid);
            // O useEffect cuidará do redirecionamento após a mensagem de sucesso
        } catch (error) {
            console.error('Erro ao criar usuário:', error?.response?.data || error);

            const status = error?.response?.status;
            const serverMsg = error?.response?.data?.error || error?.response?.data?.message || error?.response?.data?.details;

            if (status === 409) {
                setError(serverMsg || 'Já existe um usuário cadastrado com este email.');
            } else if (status === 400) {
                setError(serverMsg || 'Dados inválidos. Verifique se todos os campos obrigatórios estão preenchidos corretamente.');
            } else if (status === 500) {
                setError(serverMsg || 'Erro interno do servidor ao criar usuário. Tente novamente e verifique os dados enviados.');
            } else {
                setError(serverMsg || ('Erro ao criar usuário: ' + (error.message || 'desconhecido')));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{
                        fontFamily: "'Exo 2', sans-serif",
                        fontWeight: 'bold',
                        color: 'primary.main'
                    }}>
                        Criar Novo Usuário
                    </Typography>

                    <Box sx={{ mt: 2, mb: 2, minHeight: '70px' }}>
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
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateUserPage;
