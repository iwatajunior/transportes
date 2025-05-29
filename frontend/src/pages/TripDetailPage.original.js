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
    Card, 
    CardContent, 
    CardHeader, 
    Avatar, 
    IconButton, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    ListItemIcon, 
    ListItemText, 
    Collapse,
    Divider,
    Chip,
    TextField,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Link as MuiLink
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StatusIcon from '../components/StatusIcon';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import PlaceIcon from '@mui/icons-material/Place';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotesIcon from '@mui/icons-material/Notes';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EventIcon from '@mui/icons-material/Event';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import SpeedIcon from '@mui/icons-material/Speed';


import { useAuth } from '../contexts/AuthContext';  // Importar contexto de autenticação

// Função para obter a cor do status
const getStatusColor = (status) => {
    switch (status) {
        case 'Pendente':
            return 'warning';
        case 'Aprovada':
            return 'success';
        case 'Agendada':
            return 'warning';
        case 'Em Andamento':
            return 'info';
        case 'Concluida':
            return 'success';
        case 'Recusada':
            return 'error';
        case 'Cancelada':
            return 'warning';
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
    if (lowerStatus.includes('pendente') || lowerStatus.includes('agendada')) return 'warning';
    if (lowerStatus.includes('cancelada')) return 'error';
    return 'default';
};


const TripDetailPage = () => {
    const statusOptions = [
        { value: 'Pendente', label: 'Pendente' },
        { value: 'Aprovada', label: 'Aprovada' },
        { value: 'Agendada', label: 'Agendada' },
        { value: 'Em Andamento', label: 'Em Andamento' },
        { value: 'Concluida', label: 'Concluída' },
        { value: 'Cancelada', label: 'Cancelada' },
        { value: 'Recusada', label: 'Recusada' }
    ];
    const { id } = useParams();
    const history = useHistory();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openVehicle, setOpenVehicle] = useState(false);  // Estado para controlar o collapse do veículo
    const [openDriver, setOpenDriver] = useState(false);  // Estado para controlar o collapse do motorista
    const [openKm, setOpenKm] = useState(false);  // Estado para controlar o collapse do gerenciamento de KM
    const [activeSection, setActiveSection] = useState(null);
    const { user: authUser } = useAuth();  // Obter informações do usuário logado
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [errorVehicles, setErrorVehicles] = useState('');
    const [errorDrivers, setErrorDrivers] = useState('');
    const [isAllocating, setIsAllocating] = useState(false);
    const [allocationError, setAllocationError] = useState('');
    const [allocationSuccess, setAllocationSuccess] = useState('');
    const [allocationLoading, setAllocationLoading] = useState(false);
    const [initialKmLoading, setInitialKmLoading] = useState(false);
    const [finalKmLoading, setFinalKmLoading] = useState(false);
    const [initialKmError, setInitialKmError] = useState('');
    const [finalKmError, setFinalKmError] = useState('');
    const [initialKmSuccess, setInitialKmSuccess] = useState('');
    const [finalKmSuccess, setFinalKmSuccess] = useState('');
    const [initialKm, setInitialKm] = useState('');
    const [finalKm, setFinalKm] = useState('');
    const [kmError, setKmError] = useState('');
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };
    const [kmSuccess, setKmSuccess] = useState('');
    const [isSavingKm, setIsSavingKm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // TODO: Obter o usuário logado do contexto
    const user = { userId: 8, perfil: 'Gestor' }; // SIMULAÇÃO para teste de KM

    // Determina se o usuário atual é o motorista alocado
    // Compara IDs como números para segurança
    const isCurrentTripDriver = user && trip && Number(trip.motorista_usuarioid) === Number(user.userId);

    const canAllocate = user && (user.perfil === 'Gestor' || user.perfil === 'Administrador' || user.perfil === 'Motorista');



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
            setActiveSection(null); // Fecha todas as seções após gerenciar KM inicial
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
            setActiveSection(null); // Fecha todas as seções após gerenciar KM final
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
            setActiveSection(null); // Fecha todas as seções após a alocação
        }
    };

    // Função para deletar a viagem
    const handleDeleteTrip = async () => {
        try {
            setDeleteLoading(true);
            await api.delete(`/trips/${id}`);
            setSnackbarMessage('Viagem excluída com sucesso!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            // Redireciona para a lista de viagens após 1 segundo
            setTimeout(() => {
                history.push('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Erro ao deletar viagem:', error);
            setSnackbarMessage(error.response?.data?.message || 'Erro ao deletar viagem');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
            setActiveSection(null); // Fecha todas as seções após a deleção
        }
    };

    const handleSectionToggle = (section) => {
        setActiveSection(activeSection === section ? null : section);
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
    const handleStatusChange = async (event) => {
        try {
            setStatusLoading(true);
            const newStatus = event.target.value;
            if (!newStatus) {
                throw new Error('Status não selecionado');
            }
            
            const response = await api.put(`/trips/${id}/status`, { status: newStatus });
            setTrip(prev => ({ ...prev, status: newStatus }));
            setSnackbarMessage('Status da viagem atualizado com sucesso!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            setSnackbarMessage(error.response?.data?.message || 'Erro ao atualizar status da viagem');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setStatusLoading(false);
            setActiveSection(null); // Fecha todas as seções após atualizar status
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
                        Detalhes da Viagem <Typography component="span" variant="h4" color="primary">{trip.viagemid}</Typography>
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

                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 2 }}>

                    {/* Card: Informações Gerais */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2} sx={{ height: '100%' }}>
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
                                <Box display="flex" alignItems="center" mb={1.5}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                        <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> Origem:
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>{trip.origem || 'N/A'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" mb={1.5}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                        <FlagIcon fontSize="small" sx={{ mr: 0.5 }} /> Destino:
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>{trip.destino_completo || 'N/A'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" mb={1.5}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                        <HelpOutlineIcon fontSize="small" sx={{ mr: 0.5 }} /> Finalidade:
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>{trip.finalidade || 'N/A'}</Typography>
                                </Box>

                                {trip.centro_custo && (
                                    <Box display="flex" alignItems="center">
                                        <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                             <BusinessCenterIcon fontSize="small" sx={{ mr: 0.5 }} /> C. Custo:
                                        </Typography>
                                        <Typography variant="body2" sx={{ ml: 1 }}>{trip.centro_custo}</Typography>
                                    </Box>
                                )}
                                <Box display="flex" alignItems="center" mb={1.5}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                        <EventIcon fontSize="small" sx={{ mr: 0.5 }} /> Saída:
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>{trip.data_saida ? formatDate(trip.data_saida, true) : 'N/A'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" mb={1.5}>
                                    <Typography sx={{ minWidth: { xs: 90, sm: 120 }, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                        <EventIcon fontSize="small" sx={{ mr: 0.5 }} /> Retorno Previsto:
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>{trip.data_retorno_prevista ? formatDate(trip.data_retorno_prevista, true) : 'N/A'}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Card de Atualização de Status e Alocação */}
                    {canAllocate && (
                        <Grid item xs={12} md={6}>
                            <Card elevation={2} sx={{ height: '100%' }}>
                                <CardHeader 
                                    sx={{
                                        pb: 1,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '& .MuiCardHeader-title': {
                                            fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                            fontWeight: 600
                                        },
                                        '& .MuiAvatar-root': {
                                            bgcolor: 'white',
                                            color: 'primary.main'
                                        }
                                    }}
                                    avatar={<Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}><ChangeCircleIcon /></Avatar>}
                                    title={<Typography variant="h6">Atualizar Status</Typography>}
                                    action={
                                        <IconButton
                                            aria-label="expand"
                                            size="small"
                                            onClick={() => handleSectionToggle('status')}
                                            sx={{ color: 'white' }}
                                        >
                                            <ExpandMoreIcon sx={{ transform: activeSection === 'status' ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                        </IconButton>
                                    }
                                />
                                <Collapse in={activeSection === 'status'} timeout="auto" unmountOnExit>
                                    <CardContent>
                                        <FormControl fullWidth>
                                            <InputLabel id="status-label">Status</InputLabel>
                                            <Select
                                                labelId="status-label"
                                                id="status-select"
                                                value={trip?.status}
                                                onChange={handleStatusChange}
                                                disabled={statusLoading}
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            borderColor: statusLoading ? 'action.disabled' : 'primary.main',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: statusLoading ? 'action.disabled' : 'primary.main',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: statusLoading ? 'action.disabled' : 'primary.main',
                                                        },
                                                    }
                                                }}
                                            >
                                                {statusOptions.map((status) => (
                                                    <MenuItem key={`status-${status.value}`} value={status.value}>
                                                        <ListItemIcon>
                                                            <StatusIcon status={status.value} />
                                                        </ListItemIcon>
                                                        {status.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </CardContent>
                                </Collapse>

                                <CardHeader 
                                    sx={{
                                        pt: 0,
                                        bgcolor: 'primary.light',
                                        color: 'primary.main',
                                        '& .MuiCardHeader-title': {
                                            fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                            fontWeight: 600
                                        },
                                        '& .MuiAvatar-root': {
                                            bgcolor: 'primary.main',
                                            color: 'white'
                                        }
                                    }}
                                    avatar={<Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}><DriveEtaIcon /></Avatar>}
                                    title={<Typography variant="h6">Alocar Veículo</Typography>}
                                    action={
                                        <IconButton
                                            aria-label="expand"
                                            size="small"
                                            onClick={() => handleSectionToggle('vehicle')}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            <ExpandMoreIcon sx={{ transform: openVehicle ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                        </IconButton>
                                    }
                                />
                                <Collapse in={activeSection === 'vehicle'} timeout="auto" unmountOnExit>
                                    <CardContent>
                                        {/* Mensagens de Erro/Sucesso da Alocação */}
                                        {allocationError && <Alert severity="error" sx={{ mb: 2 }}>{allocationError}</Alert>}
                                        {allocationSuccess && <Alert severity="success" sx={{ mb: 2 }}>{allocationSuccess}</Alert>}

                                        <FormControl fullWidth>
                                            <InputLabel id="select-vehicle-label">Veículo Disponível</InputLabel>
                                            <Select
                                                labelId="select-vehicle-label"
                                                id="select-vehicle"
                                                value={selectedVehicle}
                                                label="Veículo Disponível"
                                                onChange={(e) => setSelectedVehicle(e.target.value)}
                                                disabled={isAllocating}
                                                error={!!errorVehicles}
                                                helperText={errorVehicles}
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            borderColor: errorVehicles ? 'error.main' : 'primary.main',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: errorVehicles ? 'error.main' : 'primary.main',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: errorVehicles ? 'error.main' : 'primary.main',
                                                        },
                                                    },
                                                    '& .MuiSelect-select': {
                                                        padding: '2px 8px',
                                                        fontSize: '0.75rem',
                                                        minHeight: '28px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }
                                                }}
                                            >
                                                {vehicles.map((vehicle) => (
                                                    <MenuItem key={`vehicle-${vehicle.id}`} value={vehicle.id}>
                                                        {vehicle.placa} - {vehicle.modelo}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </CardContent>
                                </Collapse>

                                <CardHeader 
                                    sx={{
                                        pt: 0,
                                        bgcolor: 'primary.light',
                                        color: 'primary.main',
                                        '& .MuiCardHeader-title': {
                                            fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                            fontWeight: 600
                                        },
                                        '& .MuiAvatar-root': {
                                            bgcolor: 'primary.main',
                                            color: 'white'
                                        }
                                    }}
                                    avatar={<Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}><GroupIcon /></Avatar>}
                                    title={<Typography variant="h6">Alocar Motorista</Typography>}
                                    action={
                                        <IconButton
                                            aria-label="expand"
                                            size="small"
                                            onClick={() => handleSectionToggle('driver')}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            <ExpandMoreIcon sx={{ transform: openDriver ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                        </IconButton>
                                    }
                                />
                                <Collapse in={activeSection === 'driver'} timeout="auto" unmountOnExit>
                                    <CardContent>
                                        <FormControl fullWidth>
                                            <InputLabel id="select-driver-label">Motorista Disponível</InputLabel>
                                            <Select
                                                labelId="select-driver-label"
                                                id="select-driver"
                                                value={selectedDriver}
                                                label="Motorista Disponível"
                                                onChange={(e) => setSelectedDriver(e.target.value)}
                                                disabled={isAllocating}
                                                error={!!errorDrivers}
                                                helperText={errorDrivers}
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            borderColor: errorDrivers ? 'error.main' : 'primary.main',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: errorDrivers ? 'error.main' : 'primary.main',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: errorDrivers ? 'error.main' : 'primary.main',
                                                        },
                                                    },
                                                    '& .MuiSelect-select': {
                                                        padding: '2px 8px',
                                                        fontSize: '0.75rem',
                                                        minHeight: '28px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }
                                                }}
                                            >
                                                {drivers.map((driver) => (
                                                    <MenuItem key={`driver-${driver.id}`} value={driver.id}>
                                                        {driver.nome}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </CardContent>
                                </Collapse>

                                <CardHeader 
                                    sx={{
                                        pt: 0,
                                        bgcolor: 'primary.light',
                                        color: 'primary.main',
                                        '& .MuiCardHeader-title': {
                                            fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                            fontWeight: 600
                                        },
                                        '& .MuiAvatar-root': {
                                            bgcolor: 'primary.main',
                                            color: 'white'
                                        }
                                    }}
                                    avatar={<Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}><SpeedIcon /></Avatar>}
                                    title={<Typography variant="h6">Gerenciar KM</Typography>}
                                    action={
                                        <IconButton
                                            aria-label="expand"
                                            size="small"
                                            onClick={() => handleSectionToggle('km')}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            <ExpandMoreIcon sx={{ transform: openKm ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                        </IconButton>
                                    }
                                />
                                <Collapse in={activeSection === 'km'} timeout="auto" unmountOnExit>
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="flex-start">
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
                                                    sx={{ height: '40px' }}
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
                                                    sx={{ height: '40px' }}
                                                >
                                                    {isSavingKm ? <CircularProgress size={24} /> : "Salvar KM Final"}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Collapse>
                            </Card>
                        </Grid>
                    )}
                </Grid> {/* Fim do Grid principal */}
            </Paper>

            {/* Snackbar para feedback */}
            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
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

