import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getUserById, updateUser } from '../services/api';
import UserForm from '../components/users/UserForm';
import { Typography, Paper, CircularProgress, Alert, Container } from '@mui/material'; // Adicionar imports do Material-UI
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

    useEffect(() => {
        const loadUserData = async () => {
            if (userId) {
                setLoading(true);
                try {
                    console.log('[EditUserPage] User ID from params:', userId);
                    const response = await getUserById(userId);
                    console.log('[EditUserPage] Dados recebidos da API:', response);
                    
                    if (!response) {
                        console.error('[EditUserPage] Dados do usuário não encontrados');
                        setError('Dados do usuário não encontrados.');
                        return;
                    }

                    // Normalizar o valor do perfil para garantir compatibilidade com o enum
                    const originalPerfil = response.perfil || '';
                    console.log('[EditUserPage] Perfil original:', originalPerfil);
                    
                    // Usar a função normalizePerfil para garantir um valor válido
                    const normalizedPerfil = normalizePerfil(originalPerfil);
                    console.log(`[EditUserPage] Perfil normalizado: "${originalPerfil}" -> "${normalizedPerfil}"`);
                    
                    const userData = {
                        nome: response.nome || '',
                        email: response.email || '',
                        perfil: normalizedPerfil,
                        setor: response.setor || '',
                        // ativo: response.ativo !== undefined ? response.ativo : true, // UserForm não lida com 'ativo' diretamente
                        fotoUrl: response.fotoperfilurl || '' // Corrigido para fotoperfilurl (minúsculas)
                    };
                    console.log('[EditUserPage] Dados mapeados para UserForm:', userData);
                    setInitialUserData(userData);
                } catch (err) {
                    console.error(`[EditUserPage] Error fetching user data for ${userId}:`, err);
                    setError(err.message || 'Falha ao carregar dados do usuário.');
                } finally {
                setLoading(false);
            }
        };

        if (userId) {
            loadUserData();
        }
    }, [userId]);

    // handleSubmit agora recebe FormData do UserForm
    const handleFormSubmit = async (formDataWithFile) => {
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // Verificar e corrigir o valor do perfil no FormData
            const perfilValue = formDataWithFile.get('perfil');
            console.log('[EditUserPage] Valor do perfil no FormData:', perfilValue);
            
            if (perfilValue) {
                // Usar a função normalizePerfil para garantir um valor válido
                const normalizedPerfil = normalizePerfil(perfilValue);
                
                if (normalizedPerfil !== perfilValue) {
                    console.log(`[EditUserPage] Perfil normalizado no FormData: "${perfilValue}" -> "${normalizedPerfil}"`);
                    // Atualizar o valor no FormData
                    formDataWithFile.set('perfil', normalizedPerfil);
                } else {
                    console.log('[EditUserPage] Perfil já está normalizado:', normalizedPerfil);
                }
            }
            
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
            console.error("[EditUserPage] Erro ao atualizar usuário:", err);
            
            // Verificar se o erro é um objeto ou uma string
            if (typeof err === 'object') {
                console.log('[EditUserPage] Tipo do erro:', typeof err);
                console.log('[EditUserPage] Propriedades do erro:', Object.keys(err));
                
                if (err.message) {
                    console.log('[EditUserPage] Mensagem de erro:', err.message);
                    setError(err.message);
                } else if (err.errors && Array.isArray(err.errors)) {
                    const errorMsg = err.errors.map(e => e.message).join(', ');
                    console.log('[EditUserPage] Erros:', errorMsg);
                    setError(errorMsg);
                } else {
                    console.log('[EditUserPage] Erro sem mensagem ou estrutura conhecida');
                    setError('Falha ao atualizar usuário. Verifique os campos ou tente novamente.');
                }
            } else {
                console.log('[EditUserPage] Erro é do tipo:', typeof err);
                setError(String(err) || 'Falha ao atualizar usuário. Verifique os campos ou tente novamente.');
            }
            
            // Mesmo com erro, vamos tentar buscar os dados do usuário novamente
            // para garantir que a interface está sincronizada com o backend
            try {
                console.log('[EditUserPage] Tentando buscar dados atualizados após erro...');
                const refreshedUser = await getUserById(userId);
                
                if (refreshedUser) {
                    console.log('[EditUserPage] Dados do usuário obtidos após erro:', refreshedUser);
                    
                    // Normalizar o perfil do usuário atualizado
                    const normalizedPerfil = normalizePerfil(refreshedUser.perfil || '');
                    console.log(`[EditUserPage] Perfil normalizado do usuário atualizado: "${refreshedUser.perfil}" -> "${normalizedPerfil}"`);
                    
                    setInitialUserData({
                        nome: refreshedUser.nome || '',
                        email: refreshedUser.email || '',
                        perfil: normalizedPerfil,
                        setor: refreshedUser.setor || '',
                        fotoUrl: refreshedUser.fotoperfilurl || ''
                    });
                    
                    // Se conseguimos obter os dados atualizados, talvez a atualização tenha funcionado
                    // apesar do erro de comunicação
                    setSuccessMessage('Os dados foram obtidos do servidor. Verifique se as informações estão corretas.');
                }
            } catch (refreshError) {
                console.error('[EditUserPage] Erro ao tentar atualizar dados após erro:', refreshError);
            }
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
