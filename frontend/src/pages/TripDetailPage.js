import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useHistory } from 'react-router-dom';
import api from '../services/api';

import { 
    Container, 
    Paper, 
    Typography, 
    CircularProgress, 
    Alert, 
    Box, 
    Grid,
    Button,
    Divider,
    Card, 
    CardHeader, 
    CardContent,
    Chip, // Para o status
    Avatar, // Para ícones nas seções
    Dialog, // Para o modal de confirmação
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, InputLabel, Select, MenuItem, TextField, 
    ButtonGroup,
    Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import NotesIcon from '@mui/icons-material/Notes';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Para motivo
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'; // Para centro de custo
import FlagIcon from '@mui/icons-material/Flag'; // Para finalidade
import EngineeringIcon from '@mui/icons-material/Engineering'; // Para Motorista e Alocação
import GroupIcon from '@mui/icons-material/Group'; // Adicionado de volta
import HailIcon from '@mui/icons-material/Hail';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';  // Importar contexto de autenticação
import { USER_ROLES } from '../utils/userConstants';  // Importar constantes de perfis

// Função para obter a cor do status
const getStatusColor = (status) => {
    switch (status) {
        case 'Agendada':
            return 'warning';
        case 'Andamento':
            return 'info';
        case 'Concluida':
            return 'success';
        case 'Cancelada':
            return 'error';
        default:
            return 'default';
    }
};

// Função auxiliar para formatar datas (mesma de antes)
const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        timeZone: 'UTC' // Usar UTC para consistência
    };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Date(dateString).toLocaleString('pt-BR', options);
};

// Função para determinar a cor do Chip de status
const getStatusChipColor = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.includes('concluída') || lowerStatus.includes('realizada')) return 'success';
    if (lowerStatus.includes('andamento') || lowerStatus.includes('iniciada')) return 'info';
    if (lowerStatus.includes('agendada')) return 'warning';
    if (lowerStatus.includes('cancelada')) return 'error';
    return 'default';
};

const TripDetailPage = () => {
    const { id } = useParams();
    const history = useHistory();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const { user: authUser } = useAuth();  // Obter informações do usuário logado
    const user = authUser;  // Usar o usuário do contexto
    
    // Verificar se o usuário está logado e tem perfil válido
    // Verificar se o usuário é Gestor ou Administrador
    const hasValidRole = user && (user.perfil === USER_ROLES.GESTOR || user.perfil === USER_ROLES.ADMINISTRADOR);
    
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [errorVehicles, setErrorVehicles] = useState('');
    const [errorDrivers, setErrorDrivers] = useState('');
    const [isAllocating, setIsAllocating] = useState(false);
    const [allocationError, setAllocationError] = useState('');
    const [allocationSuccess, setAllocationSuccess] = useState('');

    // Estados para KM
    const [initialKm, setInitialKm] = useState('');
    const [finalKm, setFinalKm] = useState('');
    const [kmError, setKmError] = useState('');
    const [kmSuccess, setKmSuccess] = useState('');
    const [isSavingKm, setIsSavingKm] = useState(false);

    // Determina se o usuário atual é o motorista alocado
    // Compara IDs como números para segurança
    const isCurrentTripDriver = user && trip && Number(trip.motorista_usuarioid) === Number(user.userId);

    // Card de alocação visível apenas para Gestor e Administrador
    const canAllocate = hasValidRole;

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Estados para Caronas (listagem simples)
    const [caronas, setCaronas] = useState([]);
    const [caronasLoading, setCaronasLoading] = useState(false);
    const [caronasError, setCaronasError] = useState('');

    const approveCarona = async (caronaId) => {
        try {
            await api.put(`/caronas/${caronaId}/status`, { status: 'Aprovado' });
            setCaronas(prev => prev.map(c => c.caronaid === caronaId ? { ...c, status: 'aprovado' } : c));
            setSnackbar({ open: true, message: 'Carona aprovada com sucesso!', severity: 'success' });
        } catch (e) {
            console.error('Erro ao aprovar carona:', e);
            setSnackbar({ open: true, message: 'Erro ao aprovar carona', severity: 'error' });
        }
    };

    const rejectCarona = async (caronaId) => {
        try {
            await api.put(`/caronas/${caronaId}/status`, { status: 'Reprovado' });
            setCaronas(prev => prev.map(c => c.caronaid === caronaId ? { ...c, status: 'reprovado' } : c));
            setSnackbar({ open: true, message: 'Carona reprovada!', severity: 'info' });
        } catch (e) {
            console.error('Erro ao reprovar carona:', e);
            setSnackbar({ open: true, message: 'Erro ao reprovar carona', severity: 'error' });
        }
    };

    // Busca dados da viagem, veículos e motoristas
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            setErrorVehicles('');
            setErrorDrivers('');
            setSelectedVehicle('');
            setSelectedDriver('');

            try {
                // 1. Buscar detalhes da viagem
                console.log(`DEBUG: Buscando detalhes da viagem ${id}`);
                try {
                    const tripResponse = await api.get(`/trips/${id}`);
                    console.log('DEBUG: Resposta completa:', tripResponse);
                    const fetchedTrip = tripResponse.data;
                    console.log('DEBUG: Detalhes da viagem recebidos:', fetchedTrip);
                    if (!fetchedTrip) {
                        throw new Error('Dados da viagem vieram vazios');
                    }
                    setTrip(fetchedTrip);
                } catch (err) {
                    console.error('DEBUG: Erro ao buscar viagem:', err);
                    throw err;
                }

                // 2. Buscar veículos disponíveis
                try {
                    console.log('DEBUG: Buscando veículos disponíveis');
                    const vehiclesResponse = await api.get('/vehicles/available');
                    console.log('DEBUG: Resposta veículos:', vehiclesResponse.data);
                    const vehiclesData = vehiclesResponse.data.vehicles || [];
                    setVehicles(vehiclesData);
                } catch (vehiclesErr) {
                    console.error('Erro ao buscar veículos disponíveis:', vehiclesErr);
                    if (vehiclesErr.response?.status !== 403) {
                       setErrorVehicles('Falha ao carregar veículos.');
                       setAllocationError('Falha parcial ao carregar dados para alocação.');
                    }
                }

                // 3. Buscar motoristas disponíveis
                try {
                    console.log('DEBUG: Buscando motoristas disponíveis');
                    const driversResponse = await api.get('/users/drivers');
                    console.log('DEBUG: Resposta motoristas:', driversResponse.data);
                    const driversData = driversResponse.data || [];
                    setDrivers(driversData);
                } catch (driversErr) {
                    console.error('Erro ao buscar motoristas disponíveis:', driversErr);
                    if (driversErr.response?.status !== 403) {
                        setErrorDrivers('Falha ao carregar motoristas.');
                        setAllocationError('Falha parcial ao carregar dados para alocação.');
                    }
                }

            } catch (err) {
                console.error(`Erro geral ao buscar dados para a viagem ${id}:`, err);
                setError(err.response?.data?.message || 'Falha ao carregar dados da viagem.');
            } finally {
                setLoading(false);
                console.log('DEBUG: Finalizou fetchData');
            }
        };

        fetchData();
    }, [id]);

    // Buscar caronas da viagem (todas: pendente/aprovado/reprovado)
    useEffect(() => {
        const fetchCaronas = async () => {
            try {
                setCaronasLoading(true);
                setCaronasError('');
                const resp = await api.get('/caronas', { params: { viagemId: id } });
                const list = Array.isArray(resp.data?.caronas) ? resp.data.caronas : [];
                setCaronas(list);
            } catch (e) {
                console.error('Erro ao carregar caronas:', e);
                setCaronas([]);
                setCaronasError('Erro ao carregar caronas');
            } finally {
                setCaronasLoading(false);
            }
        };
        fetchCaronas();
    }, [id]);

    // (Removido) Ações de aprovar/reprovar caronas



    // useEffect para pré-selecionar o motorista APÓS trip E drivers carregarem
    useEffect(() => {
        if (trip?.motorista_usuarioid && drivers?.length > 0) {
            const driverIdStr = String(trip.motorista_usuarioid);
            setSelectedDriver(driverIdStr);
        }
    }, [trip, drivers]);

    // useEffect para pré-selecionar o veículo APÓS trip E vehicles carregarem
    useEffect(() => {
        if (trip?.veiculo_alocado_id && vehicles?.length > 0) {
            setSelectedVehicle(trip.veiculo_alocado_id);
        }
    }, [trip, vehicles]);

    // useEffect para popular KM com dados da viagem
    useEffect(() => {
        if (trip) {
            setInitialKm(trip.km_inicial != null ? String(trip.km_inicial) : '');
            setFinalKm(trip.km_final != null ? String(trip.km_final) : '');
        }
    }, [trip]);

    // Função para salvar/gerenciar KM Inicial (para Gestor/Admin)
    const handleManageInitialKm = async () => {
        if (!initialKm.trim() || isNaN(Number(initialKm)) || Number(initialKm) < 0) {
            setKmError('KM Inicial inválido, não fornecido ou negativo.');
            setKmSuccess('');
            return;
        }
        setIsSavingKm(true);
        setKmError('');
        setKmSuccess('');
        try {
            const response = await api.put(`/trips/${id}/km/start`, { 
                km_inicial: Number(initialKm) 
            });
            setKmSuccess('KM Inicial salvo com sucesso!');
            setTrip(response.data.trip); // Atualiza o trip local com a resposta do backend
        } catch (err) {
            setKmError(err.response?.data?.message || 'Erro ao salvar KM Inicial.');
        } finally {
            setIsSavingKm(false);
        }
    };

    // Função para salvar/gerenciar KM Final (para Gestor/Admin)
    const handleManageFinalKm = async () => {
        if (!finalKm.trim() || isNaN(Number(finalKm)) || Number(finalKm) < 0) {
            setKmError('KM Final inválido, não fornecido ou negativo.');
            setKmSuccess('');
            return;
        }
        if (trip && (trip.km_inicial === null || trip.km_inicial === undefined)) {
            setKmError('KM Inicial deve ser registrado antes do KM Final.');
            setKmSuccess('');
            return;
        }
        if (trip && trip.km_inicial !== null && trip.km_inicial !== undefined && Number(finalKm) < Number(trip.km_inicial)) {
            setKmError('KM Final não pode ser menor que o KM Inicial já registrado.');
            setKmSuccess('');
            return;
        }
        setIsSavingKm(true);
        setKmError('');
        setKmSuccess('');
        try {
            const response = await api.put(`http://localhost:3001/api/v1/trips/${id}/km/manage-end`, { 
                km_final: Number(finalKm) 
            });
            setKmSuccess('KM Final salvo com sucesso!');
            setTrip(response.data.trip); // Atualiza o trip local com a resposta do backend
        } catch (err) {
            setKmError(err.response?.data?.message || 'Erro ao salvar KM Final.');
        } finally {
            setIsSavingKm(false);
        }
    }; // Depende de trip, drivers, e selectedDriver para evitar loop


    // Função para lidar com a submissão da alocação (igual a antes)
    const handleAllocate = async () => {
        if (!selectedVehicle && !selectedDriver) {
            setAllocationError('Selecione ao menos um veículo ou um motorista para alocar.');
            return;
        }

        setIsAllocating(true);
        setAllocationError('');
        setAllocationSuccess('');

        try {
            console.log(`Enviando alocação para viagem ${id}: Veículo=${selectedVehicle}, Motorista=${selectedDriver}`);
            const response = await api.put(`/trips/${id}/allocate`, {
                vehicleId: selectedVehicle || null,
                driverId: selectedDriver || null,
            });

            console.log('Resposta da alocação:', response.data);
            setTrip(response.data.trip); // Atualiza o estado da viagem com os dados retornados
            setAllocationSuccess('Recursos alocados com sucesso!');
        } catch (err) {
            console.error(`Erro ao alocar recursos para viagem ${id}:`, err);
            setAllocationError(err.response?.data?.message || 'Falha ao alocar recursos. Tente novamente.');
        } finally {
            setIsAllocating(false);
        }
    };

    // Função para deletar a viagem
    const handleDeleteTrip = async () => {
        try {
            setDeleteLoading(true);
            await api.delete(`/trips/${id}`);
            setSnackbar({ 
                open: true, 
                message: 'Viagem excluída com sucesso!', 
                severity: 'success' 
            });
            // Redireciona para a lista de viagens após 1 segundo
            setTimeout(() => {
                history.push('/viagens');
            }, 1000);
        } catch (error) {
            console.error('Erro ao deletar viagem:', error);
            setSnackbar({ 
                open: true, 
                message: error.response?.data?.message || 'Erro ao excluir viagem', 
                severity: 'error' 
            });
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button 
                    variant="outlined" 
                    component={RouterLink} 
                    to="/viagens"
                    startIcon={<ArrowBackIcon />}
                >
                    Voltar para Lista
                </Button>
            </Container>
        );
    }

    if (!trip) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="warning">Nenhum detalhe de viagem encontrado.</Alert>
                 <Button 
                    variant="outlined" 
                    component={RouterLink} 
                    to="/viagens"
                    startIcon={<ArrowBackIcon />}
                >
                    Voltar para Lista
                </Button>
            </Container>
        );
    }

    // Função para atualizar o status da viagem
    const handleStatusChange = async (newStatus) => {
        try {
            setStatusLoading(true);
            const response = await api.put(`/trips/${id}/status`, { status: newStatus });
            setTrip(prev => ({ ...prev, status_viagem: newStatus }));
            setSnackbar({ open: true, message: 'Status da viagem atualizado com sucesso!', severity: 'success' });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao atualizar status da viagem', severity: 'error' });
        } finally {
            setStatusLoading(false);
        }
    };

    // Verifica se o usuário é gestor
    console.log('Auth User:', user);
    const isManager = user?.perfil === 'Gestor' || user?.perfil === 'Administrador';
    console.log('É gestor?', isManager);

    // Renderiza os detalhes da viagem com novo design
    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 5, px: { xs: 2, sm: 3 } }}>
            <Paper elevation={3} sx={{ 
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 2,
                backgroundColor: 'background.paper',
                boxShadow: (theme) => theme.shadows[3]
            }}>
                {/* Cabeçalho com Título e Botões */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    mb: 3
                }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontFamily: "'Exo 2', sans-serif" }}>
                        Detalhes da Viagem <Typography component="span" variant="h4" color="primary">#{id}</Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="outlined" 
                            component={RouterLink} 
                            to="/viagens"
                            startIcon={<ArrowBackIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Voltar para Lista
                        </Button>
                        {isManager && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteDialogOpen(true)}
                                disabled={deleteLoading}
                            >
                                Excluir Viagem
                            </Button>
                        )}
                    </Box>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                {/* Grid principal para os Cards */}
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 2 }}>

                    {/* Card: Informações Gerais */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2} sx={{ height: '100%', p: 1 }}>
                            <CardHeader 
                                sx={{
                                    pb: 1,
                                    '& .MuiCardHeader-title': {
                                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                        fontWeight: 600
                                    }
                                }}
                                avatar={<Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}><PlaceIcon /></Avatar>}
                                title={<Typography variant="h6">Informações Gerais</Typography>}
                            />
                            <CardContent>
                                <Box display="flex" alignItems="flex-start" mb={1.5}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500' }}>Status:</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                                        <Chip 
                                            label={trip.status_viagem || 'N/A'}
                                            color={getStatusColor(trip.status_viagem)}
                                            size="small"
                                            sx={{ alignSelf: 'flex-start' }}
                                        />
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="flex-start" mb={1.5}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500' }}>Requisitante:</Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        {(() => {
                                            const nome = trip.solicitante_nome || trip.requisitante_nome;
                                            const setor = trip.solicitante_departamento || trip.requisitante_setor;
                                            if (nome && setor) return `${nome} - ${setor}`;
                                            if (nome) return nome;
                                            return 'N/A';
                                        })()}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" mb={1.0}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500' }}>Data Saída:</Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>{trip.data_saida ? formatDate(trip.data_saida, false) : 'N/A'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" mb={1.0}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500' }}>Data Retorno:</Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>{trip.data_retorno_prevista ? formatDate(trip.data_retorno_prevista, false) : 'N/A'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" mb={1.0}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500' }}>Horário Saída:</Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>{trip.horario_saida || 'N/A'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" mb={1.5}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500' }}>Horário Retorno:</Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>{trip.horario_retorno_previsto || 'N/A'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" mb={1.0}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500' }}>Origem:</Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        {(() => {
                                            const origem = trip.origem_completa || trip.origem || trip.local_saida || '';
                                            return origem || 'N/A';
                                        })()}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" mb={1.5}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500' }}>Destino:</Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        {(() => {
                                            const destino = trip.destino_completo || trip.destino || trip.local_destino || '';
                                            return destino || 'N/A';
                                        })()}
                                    </Typography>
                                </Box>
                                {trip.finalidade && (
                                    <Box display="flex" alignItems="center" mb={1.5}>
                                        <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                            <FlagIcon fontSize="small" sx={{ mr: 0.5 }} /> Finalidade:
                                        </Typography>
                                        <Typography variant="body2" sx={{ ml: 1 }}>{trip.finalidade}</Typography>
                                    </Box>
                                )}
                                {trip.centro_custo && (
                                    <Box display="flex" alignItems="center">
                                        <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                             <BusinessCenterIcon fontSize="small" sx={{ mr: 0.5 }} /> C. Custo:
                                        </Typography>
                                        <Typography variant="body2" sx={{ ml: 1 }}>{trip.centro_custo}</Typography>
                                    </Box>
                                )}
                                {trip.observacoes && (
                                    <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                                        <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                             <NotesIcon fontSize="small" sx={{ mr: 0.5 }} /> Observações:
                                        </Typography>
                                        <Typography variant="body2" sx={{ ml: 1 }}>{trip.observacoes}</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    

                    {/* Card: Motorista Alocado (Condicional) */}
                    {trip.motorista_nome && (
                        <Grid item xs={12} md={6}>
                            <Card elevation={2} sx={{ 
                                height: '100%',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: (theme) => theme.shadows[4]
                                }
                            }}>
                                <CardHeader 
                                    sx={{
                                        pb: 1,
                                        '& .MuiCardHeader-title': {
                                            fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                            fontWeight: 600
                                        }
                                    }}
                                    avatar={<Avatar sx={{ bgcolor: 'orange', width: 40, height: 40 }}><EngineeringIcon /></Avatar>}
                                    title={<Typography variant="h6">Motorista Alocado</Typography>}
                                />
                                <CardContent sx={{ pt: 1 }}>
                                    <Box display="flex" alignItems="flex-start">
                                        <Typography sx={{ minWidth: { xs: 70, sm: 80 }, fontWeight: '500' }}>Nome:</Typography>
                                        <Typography variant="body2" sx={{ ml: 1 }}>{trip.motorista_nome}</Typography>
                                    </Box>
                                    {/* Adicionar link para detalhes do motorista se necessário */}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    
                    {/* Card: Caronas (listagem simples) */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2} sx={{ height: '100%', p: 0.5 }}>
                            <CardHeader 
                                sx={{
                                    pb: 1,
                                    '& .MuiCardHeader-title': {
                                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                        fontWeight: 600
                                    }
                                }}
                                avatar={<Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}><HailIcon /></Avatar>}
                                title={<Typography variant="h6">Caronas</Typography>}
                            />
                            <CardContent sx={{ pt: 1 }}>
                                {caronasLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : caronasError ? (
                                    <Alert severity="error">{caronasError}</Alert>
                                ) : caronas.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">Nenhuma carona registrada para esta viagem.</Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {(() => {
                                            const order = { aprovado: 0, reprovado: 1, pendente: 2 };
                                            const arr = [...caronas].sort((a, b) => (order[String(a.status).toLowerCase()] ?? 9) - (order[String(b.status).toLowerCase()] ?? 9));
                                            return arr.map((c, idx) => {
                                                const nome = c.requisitante_nome || '';
                                                const setor = c.requisitante_setor || '';
                                                const status = String(c.status || '').toLowerCase();
                                                const motivo = (c.motivo ?? '').toString().trim();
                                                const line = `${nome || c.requisitante} - ${setor || 'N/A'} - ${status} - ${motivo || 'N/A'}`;
                                                return (
                                                    <React.Fragment key={c.caronaid}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                                                            <Typography variant="body2">{line}</Typography>
                                                            {status === 'pendente' && (
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <Button size="small" variant="contained" color="success" onClick={() => approveCarona(c.caronaid)}>Aprovar</Button>
                                                                    <Button size="small" variant="outlined" color="error" onClick={() => rejectCarona(c.caronaid)}>Reprovar</Button>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                        {idx < arr.length - 1 && <Divider sx={{ my: 0.5 }} />}
                                                    </React.Fragment>
                                                );
                                            });
                                        })()}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Card: Passageiros (Opcional) */}
                    {trip.passageiros && trip.passageiros.length > 0 && (
                        <Grid item xs={12} md={6}>
                             <Card elevation={2} sx={{ 
                                height: '100%',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: (theme) => theme.shadows[4]
                                }
                            }}>
                                <CardHeader 
                                    sx={{
                                        pb: 1,
                                        '& .MuiCardHeader-title': {
                                            fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                            fontWeight: 600
                                        }
                                    }}
                                    avatar={<Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}><GroupIcon /></Avatar>}
                                    title={<Typography variant="h6">Passageiros</Typography>}
                                />
                                <CardContent sx={{ pt: 1 }}>
                                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                        {trip.passageiros.map((p, index) => <li key={index}><Typography variant="body2">{p.nome}</Typography></li>)} 
                                    </ul>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}


                    {/* Card: Observações (Opcional) - REMOVIDO
                    {trip.observacoes && (
                        <Grid item xs={12} md={trip.passageiros && trip.passageiros.length > 0 ? 6 : 12}> 
                            <Card elevation={2} sx={{ 
                                height: '100%',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: (theme) => theme.shadows[4]
                                }
                            }}>
                                <CardHeader 
                                    sx={{
                                        pb: 1,
                                        '& .MuiCardHeader-title': {
                                            fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                            fontWeight: 600
                                        }
                                    }}
                                    avatar={<Avatar sx={{ bgcolor: 'grey.500', width: 40, height: 40 }}><NotesIcon /></Avatar>}
                                    title={<Typography variant="h6">Observações</Typography>}
                                />
                                <CardContent sx={{ pt: 1 }}>
                                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{trip.observacoes}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    */}
                    
                    {/* === Card de Alocação (Condicional) === */}
                    {canAllocate && (
                        <Grid item xs={12}>
                            <Card elevation={2} sx={{ mt: 2, display: hasValidRole ? 'block' : 'none' }}>
                                <CardHeader 
                                    avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><EngineeringIcon /></Avatar>}
                                    title={<Typography variant="h6">Alocar Recursos</Typography>}
                                />
                                <CardContent>
                                    {/* Mensagens de Erro/Sucesso da Alocação */}
                                    {allocationError && <Alert severity="error" sx={{ mb: 2 }}>{allocationError}</Alert>}
                                    {allocationSuccess && <Alert severity="success" sx={{ mb: 2 }}>{allocationSuccess}</Alert>}
                                    
                                    <Grid container spacing={2}>
                                        {/* Select Veículo */}
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth variant="outlined" size="small">
                                                <InputLabel id="select-vehicle-label">Veículo Disponível</InputLabel>
                                                <Select
                                                    labelId="select-vehicle-label"
                                                    id="select-vehicle"
                                                    value={selectedVehicle}
                                                    onChange={(e) => setSelectedVehicle(e.target.value)}
                                                    label="Veículo Disponível"
                                                    disabled={isAllocating}
                                                >
                                                    <MenuItem value="">
                                                        <em>Selecione um Veículo</em>
                                                    </MenuItem>
                                                    {errorVehicles ? (
                                                        <MenuItem disabled value="">
                                                            <em>{errorVehicles}</em>
                                                        </MenuItem>
                                                    ) : !vehicles || vehicles.length === 0 ? (
                                                        <MenuItem disabled value="">
                                                            <em>Carregando veículos...</em>
                                                        </MenuItem>
                                                    ) : (
                                                        // Inclui o veículo já alocado, se houver
                                                        trip.veiculo_alocado_id && (
                                                            <MenuItem key={trip.veiculo_alocado_id} value={trip.veiculo_alocado_id}>
                                                                {trip.veiculo_alocado_marca} {trip.veiculo_alocado_modelo} ({trip.veiculo_alocado_placa}) - ID: {trip.veiculo_alocado_id}
                                                            </MenuItem>
                                                        ) || (
                                                            // Se não houver veículo alocado, mostra os disponíveis
                                                            vehicles.map((vehicle) => (
                                                                <MenuItem key={vehicle.veiculoid} value={vehicle.veiculoid}>
                                                                    {vehicle.marca} {vehicle.modelo} ({vehicle.placa}) - ID: {vehicle.veiculoid}
                                                                </MenuItem>
                                                            ))
                                                        )
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Select Motorista */}
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth variant="outlined" size="small">
                                                <InputLabel id="select-driver-label">Motorista Disponível</InputLabel>
                                                <Select
                                                    labelId="driver-select-label"
                                                    id="driver-select"
                                                    value={selectedDriver}
                                                    label="Motorista Alocado"
                                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                                    disabled={isAllocating || !canAllocate}
                                                >
                                                    <MenuItem value="">
                                                        <em>Selecione um Motorista</em>
                                                    </MenuItem>
                                                    {errorDrivers ? (
                                                        <MenuItem disabled value="">
                                                            <em>{errorDrivers}</em>
                                                        </MenuItem>
                                                    ) : !drivers || drivers.length === 0 ? (
                                                        <MenuItem disabled value="">
                                                            <em>Carregando motoristas...</em>
                                                        </MenuItem>
                                                    ) : (
                                                        drivers.map((driver) => (
                                                            <MenuItem key={driver.userid} value={String(driver.userid)}>
                                                                {driver.nome}
                                                            </MenuItem>
                                                        ))
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    {/* Botão Alocar */}
                                    <Box mt={2} display="flex" justifyContent="flex-end">
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleAllocate}
                                            disabled={isAllocating || (!selectedVehicle && !selectedDriver)}
                                            startIcon={isAllocating ? <CircularProgress size={20} color="inherit" /> : <EngineeringIcon />}
                                        >
                                            {isAllocating ? 'Alocando...' : 'Alocar Selecionados'}
                                        </Button>
                                    </Box>

                                    {console.log('Verificando usuário para campos KM:', user)}
                                    {/* Campos e Botões para Gerenciar KM (Apenas para Gestor/Admin) */}
                                    {user && (user.perfil === 'Gestor' || user.perfil === 'Administrador') && (
                                        <Box mt={3} pt={2} borderTop={1} borderColor="divider">
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', display: hasValidRole ? 'block' : 'none' }}>
                                                Gerenciar Quilometragem da Viagem
                                            </Typography>
                                            {kmError && <Alert severity="error" sx={{ mb: 2, display: hasValidRole ? 'block' : 'none' }}>{kmError}</Alert>}
                                            {kmSuccess && <Alert severity="success" sx={{ mb: 2, display: hasValidRole ? 'block' : 'none' }}>{kmSuccess}</Alert>}
                                            <Grid container spacing={2} alignItems="flex-start" sx={{ display: hasValidRole ? 'flex' : 'none' }}>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="KM Inicial"
                                                        type="number"
                                                        value={initialKm}
                                                        onChange={(e) => setInitialKm(e.target.value)}
                                                        disabled={isSavingKm}
                                                        variant="outlined"
                                                        size="small"
                                                        InputLabelProps={{ shrink: true }}
                                                        helperText={trip?.km_inicial_registrado_por_nome ? `Por: ${trip.km_inicial_registrado_por_nome}` : (trip?.km_inicial !== null && trip?.km_inicial !== undefined ? '' : 'Pendente')}
                                                        inputProps={{ min: 0 }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={handleManageInitialKm}
                                                        disabled={isSavingKm || !initialKm.trim() || (trip?.km_inicial !== null && Number(initialKm) === Number(trip.km_inicial))}
                                                        size="medium"
                                                        sx={{ height: '40px', display: hasValidRole ? 'block' : 'none' }}
                                                    >
                                                        {isSavingKm ? <CircularProgress size={24} /> : "Salvar KM Inicial"}
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="KM Final"
                                                        type="number"
                                                        value={finalKm}
                                                        onChange={(e) => setFinalKm(e.target.value)}
                                                        disabled={isSavingKm || trip?.km_inicial === null || trip?.km_inicial === undefined}
                                                        variant="outlined"
                                                        size="small"
                                                        InputLabelProps={{ shrink: true }}
                                                        helperText={trip?.km_final_registrado_por_nome ? `Por: ${trip.km_final_registrado_por_nome}` : (trip?.km_final !== null && trip?.km_final !== undefined ? '' : (trip?.km_inicial === null || trip?.km_inicial === undefined ? 'KM Inicial pendente' : 'Pendente'))}
                                                        inputProps={{ min: trip?.km_inicial !== null && trip?.km_inicial !== undefined ? Number(trip.km_inicial) : 0 }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={handleManageFinalKm}
                                                        disabled={isSavingKm || !finalKm.trim() || trip?.km_inicial === null || trip?.km_inicial === undefined || (trip?.km_final !== null && Number(finalKm) === Number(trip.km_final)) || (Number(finalKm) < Number(trip?.km_inicial || 0))}
                                                        size="medium"
                                                        sx={{ height: '40px', display: hasValidRole ? 'block' : 'none' }}
                                                    >
                                                        {isSavingKm ? <CircularProgress size={24} /> : "Salvar KM Final"}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Botões de Status */}
                                    {isManager && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                                Gerenciar Status da Viagem
                                            </Typography>
                                            <ButtonGroup 
                                                size="small" 
                                                orientation="horizontal" 
                                                variant="outlined" 
                                                disabled={statusLoading}
                                            >
                                                <Button
                                                    onClick={() => handleStatusChange('Agendada')}
                                                    disabled={trip.status_viagem === 'Agendada'}
                                                    color="warning"
                                                    startIcon={<ChangeCircleIcon />}
                                                >
                                                    Agendar
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusChange('Andamento')}
                                                    disabled={trip.status_viagem === 'Andamento'}
                                                    color="info"
                                                    startIcon={<ChangeCircleIcon />}
                                                >
                                                    Andamento
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusChange('Concluida')}
                                                    disabled={trip.status_viagem === 'Concluida'}
                                                    color="success"
                                                    startIcon={<ChangeCircleIcon />}
                                                >
                                                    Concluir
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusChange('Cancelada')}
                                                    disabled={trip.status_viagem === 'Cancelada'}
                                                    color="error"
                                                    startIcon={<ChangeCircleIcon />}
                                                >
                                                    Cancelar
                                                </Button>
                                            </ButtonGroup>
                                        </Box>
                                    )}

                                    {/* Mensagens de erro/sucesso para KM */}
                                    {kmError && (
                                        <Alert severity="error" sx={{ mt: 2 }}>
                                            {kmError}
                                        </Alert>
                                    )}
                                    {kmSuccess && (
                                        <Alert severity="success" sx={{ mt: 2 }}>
                                            {kmSuccess}
                                        </Alert>
                                    )}

                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid> {/* Fim do Grid principal */}
            </Paper>

            {/* Snackbar para feedback */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Dialog de confirmação de exclusão */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteLoading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleDeleteTrip}
                        color="error"
                        disabled={deleteLoading}
                        startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                    >
                        {deleteLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TripDetailPage;
