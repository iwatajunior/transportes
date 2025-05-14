import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getUserById, updateUser } from '../services/api';
import UserForm from '../components/users/UserForm'; // Importar UserForm
import { Typography, Paper, CircularProgress, Alert, Container } from '@mui/material'; // Adicionar imports do Material-UI

const EditUserPage = () => {
    const { userId } = useParams();
    console.log('[EditUserPage] User ID from params:', userId);
    const history = useHistory();

    // Estado para os dados iniciais do UserForm
    const [initialUserData, setInitialUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getUserById(userId);
                console.log('[EditUserPage] Data received from API (getUserById):', data);
                console.log('[EditUserPage] Perfil do usuário:', data.perfil);

                if (data) {
                    // Mapear os dados da API para o formato esperado pelo UserForm
                    console.log('[EditUserPage] Dados brutos do usuário:', data);
                    const userData = {
                        nome: data.nome || '',
                        email: data.email || '',
                        perfil: (data.perfil || '').toLowerCase(),
                        setor: data.setor || '',
                        // ativo: data.ativo !== undefined ? data.ativo : true, // UserForm não lida com 'ativo' diretamente
                        fotoUrl: data.fotoperfilurl || '' // Corrigido para fotoperfilurl (minúsculas)
                    };
                    console.log('[EditUserPage] Dados mapeados para UserForm:', userData);
                    setInitialUserData(userData);
                    console.log('[EditUserPage] Formed initialUserData:', {
                        nome: data.nome || '',
                        email: data.email || '',
                        perfil: data.perfil || '',
                        setor: data.setor || '',
                        fotoUrl: data.fotoUrl || data.profileImageUrl || ''
                    });
                } else {
                    setError('Usuário não encontrado.');
                }
            } catch (err) {
                console.error(`[EditUserPage] Error fetching user data for ${userId}:`, err);
                setError(err.message || 'Falha ao carregar dados do usuário.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    // handleSubmit agora recebe FormData do UserForm
    const handleFormSubmit = async (formDataWithFile) => {
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // FormData já está pronto para ser enviado
            const result = await updateUser(userId, formDataWithFile);
            setSuccessMessage(result.message || 'Usuário atualizado com sucesso!');
            
            // Opcional: atualizar initialUserData se a API retornar o usuário atualizado com a nova fotoUrl
            if (result.user) {
                setInitialUserData(prev => ({ 
                    ...prev,
                    nome: result.user.nome || '',
                    email: result.user.email || '',
                    perfil: result.user.perfil || '',
                    setor: result.user.setor || '',
                    fotoUrl: result.user.fotoperfilurl || prev.fotoUrl // Corrigido para fotoperfilurl (minúsculas)
                }));
            }

            setTimeout(() => {
                // Considerar redirecionar para a página de perfil do usuário ou lista, dependendo da UX
                history.push('/admin/users'); 
            }, 2000);

        } catch (err) {
            console.error("Erro ao atualizar usuário:", err);
            const apiErrorMessage = err.response?.data?.message || err.message || (err.errors && err.errors.map(e => e.message).join(', '));
            setError(apiErrorMessage || 'Falha ao atualizar usuário. Verifique os campos ou tente novamente.');
        } finally {
            setLoading(false);
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
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Editar Usuário (ID: {userId})
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
                    />
                )}
            </Paper>
        </Container>
    );
};

export default EditUserPage;
