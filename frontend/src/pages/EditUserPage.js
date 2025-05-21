import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getUserById, updateUser, updateUserStatus } from '../services/api';
import UserForm from '../components/users/UserForm';
import { Typography, Paper, CircularProgress, Alert, Container, Box } from '@mui/material'; // Adicionar imports do Material-UI
import { normalizePerfil } from '../utils/userConstants';

const EditUserPage = () => {
    const { userId } = useParams();
    console.log('[EditUserPage] User ID from params:', userId);
    const history = useHistory();

    // Estado para os dados iniciais do UserForm
    const [initialUserData, setInitialUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            if (userId) {
                setLoading(true);
                try {
                    console.log('[EditUserPage] Carregando dados do usuário:', userId);
                    const response = await getUserById(userId);
                    console.log('[EditUserPage] Dados recebidos:', response);
                    
                    if (!response) {
                        throw new Error('Dados do usuário não encontrados');
                    }

                    const userData = {
                        nome: response.nome || '',
                        email: response.email || '',
                        perfil: normalizePerfil(response.perfil),
                        setor: response.setor || '',
                        fotoUrl: response.fotoperfilurl || '',
                        status: response.status ?? true
                    };
                    
                    console.log('[EditUserPage] Dados mapeados:', userData);
                    setInitialUserData(userData);
                    setUser(userData);
                } catch (err) {
                    console.error('[EditUserPage] Erro ao carregar dados:', err);
                    setError(err.message || 'Falha ao carregar dados do usuário');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (userId) {
            loadUserData();
        }
    }, [userId]);

    // handleSubmit agora recebe FormData do UserForm
    const handleFormSubmit = async (formData) => {
        try {
            setError(null);
            const result = await updateUser(userId, formData);
            setUser(result);
            history.push('/admin/users');
        } catch (err) {
            setError('Erro ao atualizar usuário');
            console.error('Erro ao atualizar usuário:', err);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setError(null);
            console.log(`[EditUserPage] Iniciando atualização do status do usuário ${userId} para ${newStatus}`);
            
            // Verificar se o usuário existe antes de tentar atualizar
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Garantir que o status é um booleano
            const statusValue = Boolean(newStatus);
            console.log(`[EditUserPage] Status convertido para booleano:`, statusValue);

            const updatedUser = await updateUserStatus(userId, statusValue);
            console.log(`[EditUserPage] Resposta da API após atualização:`, updatedUser);
            
            if (!updatedUser) {
                throw new Error('Falha ao atualizar status do usuário');
            }

            // Atualizar o estado local com os dados atualizados
            setUser(prevUser => ({
                ...prevUser,
                status: statusValue
            }));
            
            setInitialUserData(prev => ({
                ...prev,
                status: statusValue
            }));
            
            setSuccessMessage('Status do usuário atualizado com sucesso!');
            
            // Log do estado atualizado
            console.log(`[EditUserPage] Estado atualizado:`, {
                user: {
                    ...user,
                    status: statusValue
                },
                initialUserData: {
                    ...initialUserData,
                    status: statusValue
                }
            });
        } catch (err) {
            console.error('[EditUserPage] Erro ao atualizar status:', err);
            setError(err.message || 'Erro ao atualizar status do usuário');
        }
    };

    if (loading && !initialUserData) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Não renderizar o formulário se initialUserData ainda não foi carregado e não há erro geral
    if (!initialUserData && !error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h6">Carregando dados do usuário...</Typography>
                <CircularProgress sx={{mt: 2}}/>
            </Container>
        );
    } 
    
    // Se houve um erro ao carregar dados iniciais e não há dados para o formulário
    if (error && !initialUserData) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">Erro ao carregar dados: {error}</Alert>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{
                        fontFamily: "'Exo 2', sans-serif",
                        fontWeight: 'bold',
                        color: 'primary.main'
                    }}>
                        Editar Usuário
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        ID: {userId}
                    </Typography>

                    {/* Exibir erro geral da página aqui, se houver, e não relacionado ao formulário em si */}
                    {error && !successMessage && initialUserData && (
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    )}
                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
                    )}

                    {initialUserData && (
                        <UserForm 
                            onSubmit={handleFormSubmit} 
                            isLoading={loading} 
                            initialData={initialUserData} 
                            isEditMode={true} 
                            onStatusChange={handleStatusChange}
                        />
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default EditUserPage;
