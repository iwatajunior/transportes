import React, { useState, useEffect, useCallback } from 'react';
import api, { getUsers } from '../services/api';
import {
    Container, Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, IconButton,
    Avatar, Stack, Chip, Tooltip, useTheme, TextField, FormControl, InputLabel, Select, MenuItem,
    Grid, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, Snackbar, Alert as MuiAlert
} from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HailIcon from '@mui/icons-material/Hail';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FlagIcon from '@mui/icons-material/Flag';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../contexts/AuthContext';

const TripListPage = () => {
    const theme = useTheme();
    const history = useHistory();
    const { user: authUser } = useAuth();
    const [trips, setTrips] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(6);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [openCaronaModal, setOpenCaronaModal] = useState(false);
    const [selectUserOpen, setSelectUserOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [usersOptions, setUsersOptions] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [includeMe, setIncludeMe] = useState(true);
    const [caronaMotivo, setCaronaMotivo] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingCarona, setIsSavingCarona] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState({
        origem: '',
        destino: '',
        solicitante: '',
        dataSaida: '',
        dataRetorno: '',
        status: '',
        veiculo: '',
        motorista: '',
        textoGeral: ''
    });
    // Função para atualizar os filtros
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Função para aplicar os filtros
    const applyFilters = useCallback(() => {
        const filtered = trips.filter(trip => {
            const origemStr = (trip.origem || trip.origem_completa || '').toLowerCase();
            const matchDestino = !filters.destino || trip.destino_completo?.toLowerCase().includes(filters.destino.toLowerCase());
            const matchOrigem = !filters.origem || origemStr.includes(filters.origem.toLowerCase());
            const matchSolicitante = !filters.solicitante || trip.solicitante_nome?.toLowerCase().includes(filters.solicitante.toLowerCase());
            const matchDataSaida = !filters.dataSaida || trip.data_saida?.includes(filters.dataSaida);
            const matchDataRetorno = !filters.dataRetorno || trip.data_retorno_prevista?.includes(filters.dataRetorno);
            const matchStatus = !filters.status || trip.status_viagem?.toLowerCase() === filters.status.toLowerCase();
            const matchVeiculo = !filters.veiculo || (
                trip.veiculo_alocado_modelo?.toLowerCase().includes(filters.veiculo.toLowerCase()) ||
                trip.veiculo_alocado_placa?.toLowerCase().includes(filters.veiculo.toLowerCase())
            );
            const matchMotorista = !filters.motorista || trip.motorista_nome?.toLowerCase().includes(filters.motorista.toLowerCase());
            const matchTextoGeral = !filters.textoGeral ||
                trip.finalidade?.toLowerCase().includes(filters.textoGeral.toLowerCase()) ||
                trip.observacoes?.toLowerCase().includes(filters.textoGeral.toLowerCase());

            return matchOrigem && matchDestino && matchSolicitante && matchDataSaida && matchDataRetorno &&
                   matchStatus && matchVeiculo && matchMotorista && matchTextoGeral;
        });
        setFilteredTrips(filtered);
    }, [trips, filters]);

    useEffect(() => {
        applyFilters();
    }, [filters, trips, applyFilters]);

    const clearFilters = () => {
        setFilters({
            destino: '',
            solicitante: '',
            dataSaida: '',
            dataRetorno: '',
            status: '',
            veiculo: '',
            motorista: '',
            textoGeral: ''
        });
        setPage(0);
    };

    const fetchTrips = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/trips?scope=home');
            console.log('Dados das viagens:', response.data);
            setTrips(response.data || []);
        } catch (err) {
            console.error("Erro ao buscar viagens:", err);
            setError(err.response?.data?.message || 'Falha ao buscar viagens. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
          .toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };
    const formatTime = (value) => {
        if (!value) return '--:--';
        // If already a HH:mm or HH:mm:ss string
        if (typeof value === 'string') {
            const match = value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
            if (match) return `${match[1]}:${match[2]}h`;
        }
        // Fallback: try parsing as date/datetime
        const d = new Date(value);
        if (isNaN(d.getTime())) return '--:--';
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}h`;
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="contained" onClick={fetchTrips}>
                    Tentar Novamente
                </Button>
            </Container>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pendente':
                return { color: 'default', icon: <HelpOutlineIcon /> };
            case 'Agendada':
                return { color: 'warning', icon: <EventIcon /> };
            case 'Andamento':
                return { color: 'primary', icon: <AccessTimeIcon /> };
            case 'Concluida':
                return { color: 'success', icon: <TaskAltIcon /> };
            case 'Cancelada':
                return { color: 'error', icon: <CancelIcon /> };
            default:
                return { color: 'default', icon: <HelpOutlineIcon /> };
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
            <Paper elevation={3} sx={{ p: 1.5, backgroundColor: '#FFFFFF', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                        <DirectionsCarIcon sx={{ fontSize: '2rem' }} />
                        Painel de Viagens
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddCircleOutlineIcon />}
                            sx={{ fontFamily: "'Exo 2', sans-serif" }}
                            onClick={async () => {
                                try {
                                    const myId = authUser?.userId;
                                    // Considera apenas minhas viagens concluídas (solicitante_usuarioid == meu id)
                                    const concluded = (trips || []).filter((t) => 
                                        String(t.status_viagem || '').toLowerCase() === 'concluida' && 
                                        Number(t.solicitante_usuarioid) === Number(myId)
                                    );
                                    if (concluded.length === 0) {
                                        history.push('/registrar-viagem');
                                        return;
                                    }
                                    const evalResp = await api.get('/evaluations');
                                    const all = evalResp.data?.evaluations || evalResp.data || [];
                                    const myEvalsByTrip = new Set(
                                        (all || [])
                                            .filter((e) => String(e.user_id) === String(myId))
                                            .map((e) => String(e.tripid))
                                    );
                                    const hasPending = concluded.some((t) => !myEvalsByTrip.has(String(t.tripid)));
                                    if (hasPending) {
                                        setSnackbar({ open: true, message: 'Antes de solicitar uma nova viagem, é necessário avaliar sua última experiência. Acesse Minhas Viagens e conclua a avaliação.', severity: 'warning' });
                                    } else {
                                        history.push('/registrar-viagem');
                                    }
                                } catch (e) {
                                    // Em caso de erro na checagem, permitir navegação para não travar o fluxo
                                    history.push('/registrar-viagem');
                                }
                            }}
                        >
                            Nova Viagem
                        </Button>
                    </Box>
                </Box>

                {/* Barra de Filtros */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 1,
                        mb: 1.5,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.grey[200]}`
                    }}
                >

                    <Grid container spacing={1} sx={{ mb: 1 }} columns={12}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Origem"
                                value={filters.origem}
                                onChange={(e) => handleFilterChange('origem', e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <PlaceIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Destino"
                                value={filters.destino}
                                onChange={(e) => handleFilterChange('destino', e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <PlaceIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Solicitante"
                                value={filters.solicitante}
                                onChange={(e) => handleFilterChange('solicitante', e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Data Saída"
                                value={filters.dataSaida}
                                onChange={(e) => handleFilterChange('dataSaida', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <EventIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Data Retorno"
                                value={filters.dataRetorno}
                                onChange={(e) => handleFilterChange('dataRetorno', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <EventIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    label="Status"
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    size="small"
                                    startAdornment={
                                        <FlagIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    }
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="Pendente">Pendente</MenuItem>
                                    <MenuItem value="Agendada">Agendada</MenuItem>
                                    <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                                    <MenuItem value="Concluída">Concluída</MenuItem>
                                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Veículo"
                                value={filters.veiculo}
                                onChange={(e) => handleFilterChange('veiculo', e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <DirectionsCarIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Motorista"
                                    value={filters.motorista}
                                    onChange={(e) => handleFilterChange('motorista', e.target.value)}
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                        ),
                                    }}
                                />
                                <Tooltip title="Limpar filtros">
                                    <IconButton size="small" onClick={clearFilters} aria-label="Limpar filtros">
                                        <FilterAltOffIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                        
                    </Grid>
                </Paper>

            {/* Lista de Viagens */}
            <TableContainer>
                <Table 
                    size="small" 
                    sx={{ 
                        minWidth: 800,
                        backgroundColor: theme.palette.background.paper,
                        '& .MuiTableCell-root': {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            padding: '8px 16px'
                        }
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    padding: '8px 16px',
                                    width: 40
                                }}
                            >ID</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    padding: '8px 16px',
                                    width: 50
                                }}
                            >Status</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 1,
                                    px: 2,
                                    width: 140
                                }}
                            >Origem</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 1,
                                    px: 2,
                                    width: 140
                                }}
                            >Destino</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 1,
                                    px: 2,
                                    width: 160
                                }}
                            >Solicitante</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 1,
                                    px: 2,
                                    width: 90
                                }}
                            >Data/Hora<br/>Saída</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 0,
                                    px: 0,
                                    width: 0,
                                    display: 'none'
                                }}
                            >Horário<br/>Saída</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 1,
                                    px: 2,
                                    width: 90
                                }}
                            >Data/Hora<br/>Retorno</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 0,
                                    px: 0,
                                    width: 0,
                                    display: 'none'
                                }}
                            >Horário<br/>Retorno</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 1,
                                    px: 2,
                                    width: 140
                                }}
                            >Veículo</TableCell>
                            <TableCell 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 1,
                                    px: 2,
                                    width: 160
                                }}
                            >Motorista</TableCell>
                            <TableCell 
                                align="right"
                                sx={{ 
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    py: 1,
                                    px: 2,
                                    width: 64
                                }}
                            >Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTrips.map((trip) => (
                            <TableRow 
                                key={trip.tripid}
                                sx={{
                                    '&:nth-of-type(odd)': {
                                        backgroundColor: theme.palette.action.hover,
                                    },
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.selected
                                    },
                                    '& td': { 
                                        fontSize: '0.875rem',
                                        py: 1
                                    }
                                }}
                            >
                                <TableCell sx={{ py: 1, px: 2, whiteSpace: 'nowrap', width: 40 }}>#{trip.tripid}</TableCell>
                                <TableCell sx={{ py: 1, px: 2, width: 50 }}>
                                    <Tooltip title={trip.status_viagem || 'Status'}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            color: theme.palette[getStatusColor(trip.status_viagem).color]?.main
                                        }}>
                                            {getStatusColor(trip.status_viagem).icon}
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                                <TableCell sx={{ py: 1, px: 2, maxWidth: 140, whiteSpace: 'nowrap' }}>
                                    <Typography variant="body2" noWrap>{trip.origem || trip.origem_completo || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 1, px: 2, maxWidth: 140, whiteSpace: 'nowrap' }}>
                                    <Typography variant="body2" noWrap>{trip.destino_completo}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 1, px: 2, maxWidth: 160 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar
                                            src={trip.solicitante_avatar ? `http://10.1.1.42:3001${trip.solicitante_avatar}` : undefined}
                                            sx={{ 
                                                width: 32, 
                                                height: 32,
                                                border: '2px solid',
                                                borderColor: 'primary.main',
                                                backgroundColor: 'primary.lighter',
                                                color: 'primary.dark',
                                                fontSize: '1rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            {trip.solicitante_nome?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    color: 'text.primary',
                                                    lineHeight: 1.2
                                                }}
                                            >
                                                {trip.solicitante_nome}
                                            </Typography>
                                            {trip.solicitante_departamento && (
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: 'text.secondary',
                                                        display: 'block'
                                                    }}
                                                >
                                                    {trip.solicitante_departamento}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1, px: 2, maxWidth: 90, whiteSpace: 'nowrap' }}>
                                    <Box>
                                        <Typography variant="body2" noWrap>{formatDate(trip.data_saida)}</Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap>{formatTime(trip.horario_saida)}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 0, px: 0, maxWidth: 0, whiteSpace: 'nowrap', display: 'none' }}>{formatTime(trip.horario_saida)}</TableCell>
                                <TableCell sx={{ py: 1, px: 2, maxWidth: 90, whiteSpace: 'nowrap' }}>
                                    <Box>
                                        <Typography variant="body2" noWrap>{formatDate(trip.data_retorno_prevista)}</Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap>{formatTime(trip.horario_retorno_previsto)}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 0, px: 0, maxWidth: 0, whiteSpace: 'nowrap', display: 'none' }}>{formatTime(trip.horario_retorno_previsto)}</TableCell>
                                <TableCell sx={{ py: 1, px: 2, maxWidth: 140 }}>
                                    {trip.veiculo_alocado_modelo} 
                                    {trip.veiculo_alocado_placa && (
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            {trip.veiculo_alocado_placa}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell sx={{ py: 1, px: 2, maxWidth: 160 }}>
                                        {trip.motorista_nome ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar
                                                    src={trip.motorista_avatar ? `http://10.1.1.42:3001${trip.motorista_avatar}` : undefined}
                                                    sx={{ 
                                                        width: 32, 
                                                        height: 32,
                                                        border: '2px solid',
                                                        borderColor: 'primary.main',
                                                        backgroundColor: 'primary.lighter',
                                                        color: 'primary.dark',
                                                        fontSize: '1rem',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {trip.motorista_nome.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            fontWeight: 500,
                                                            color: 'text.primary',
                                                            lineHeight: 1.2
                                                        }}
                                                    >
                                                        {trip.motorista_nome}
                                                    </Typography>
                                                    {trip.motorista_categoria && (
                                                        <Typography 
                                                            variant="caption" 
                                                            sx={{ 
                                                                color: 'text.secondary',
                                                                display: 'block'
                                                            }}
                                                        >
                                                            {trip.motorista_categoria}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Typography 
                                                variant="body2" 
                                                sx={{ color: 'text.disabled' }}
                                            >
                                                Não alocado
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1, px: 2, width: 112 }}>
                                        <Box sx={{ display:'flex', justifyContent:'flex-end', gap: 0.5 }}>
                                            {String(trip.status_viagem).toLowerCase() === 'agendada' && (
                                                <Tooltip title="Pedir Carona">
                                                    <IconButton
                                                        size="small"
                                                        onClick={async () => {
                                                            setSelectedTrip(trip);
                                                            setSelectUserOpen(true);
                                                            setIncludeMe(true);
                                                            if (authUser?.userId != null) {
                                                                setSelectedUserIds([String(authUser.userId)]);
                                                            } else {
                                                                setSelectedUserIds([]);
                                                            }
                                                            if (!usersOptions || usersOptions.length === 0) {
                                                                try {
                                                                    setUsersLoading(true);
                                                                    const data = await getUsers();
                                                                    setUsersOptions(Array.isArray(data) ? data : (data?.users || []));
                                                                } catch (e) {
                                                                    console.error('Erro ao carregar usuários para carona:', e);
                                                                    setUsersOptions([]);
                                                                } finally {
                                                                    setUsersLoading(false);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <HailIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Ver Detalhes">
                                                <IconButton
                                                    component={RouterLink}
                                                    to={`/viagens/${trip.tripid}`}
                                                    size="small"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={trips.length}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Itens por página"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    rowsPerPageOptions={[6, 12, 24, 48]}
                    sx={{
                        borderTop: 1,
                        borderColor: 'divider'
                    }}
                />

                {/* Modal Pedir Carona (mínimo, sem conteúdo) */}
                <Dialog
                    open={openCaronaModal}
                    onClose={() => setOpenCaronaModal(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: '#FFFFFF',
                            borderRadius: 2
                        }
                    }}
                >
                    <DialogTitle sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        fontWeight: 600
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HailIcon sx={{ color: theme.palette.primary.contrastText }} />
                            Pedir Carona
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px' }}>Status</TableCell>
                                        <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px' }}>Origem</TableCell>
                                        <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px' }}>Destino</TableCell>
                                        <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px' }}>Data Saída</TableCell>
                                        <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px' }}>Data Retorno</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {trips
                                        .filter((trip) => trip.status_viagem === 'Agendada')
                                        .map((trip) => (
                                            <TableRow 
                                                key={trip.tripid}
                                                hover
                                                sx={{ cursor: 'pointer' }}
                                                onClick={async () => {
                                                    setSelectedTrip(trip);
                                                    setSelectUserOpen(true);
                                                    // Pré-seleciona "meu usuário" por padrão e permite adicionar outros
                                                    setIncludeMe(true);
                                                    if (authUser?.userId != null) {
                                                        setSelectedUserIds([String(authUser.userId)]);
                                                    } else {
                                                        setSelectedUserIds([]);
                                                    }
                                                    if (!usersOptions || usersOptions.length === 0) {
                                                        try {
                                                            setUsersLoading(true);
                                                            const data = await getUsers();
                                                            setUsersOptions(Array.isArray(data) ? data : (data?.users || []));
                                                        } catch (e) {
                                                            console.error('Erro ao carregar usuários para carona:', e);
                                                            setUsersOptions([]);
                                                        } finally {
                                                            setUsersLoading(false);
                                                        }
                                                    }
                                                }}
                                            >
                                                <TableCell>
                                                    <Chip
                                                        label={trip.status_viagem}
                                                        color={getStatusColor(trip.status_viagem).color}
                                                        size="small"
                                                        icon={getStatusColor(trip.status_viagem).icon}
                                                        sx={{
                                                            fontWeight: 500,
                                                            '& .MuiChip-icon': {
                                                                color: 'inherit'
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{trip.origem || trip.origem_completa || 'N/A'}</TableCell>
                                                <TableCell>{trip.destino_completo || 'N/A'}</TableCell>
                                                <TableCell>{formatDate(trip.data_saida)}</TableCell>
                                                <TableCell>{formatDate(trip.data_retorno_prevista)}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCaronaModal(false)}>Fechar</Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog para selecionar usuário da carona */}
                <Dialog
                    open={selectUserOpen}
                    onClose={() => { setSelectUserOpen(false); setSelectedUserIds([]); setCaronaMotivo(''); }}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Selecionar Usuários para Carona</DialogTitle>
                    <DialogContent>
                        {/* Opção para incluir o usuário atual junto com outros */}
                        <Box sx={{ mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={includeMe}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setIncludeMe(checked);
                                            const myId = authUser?.userId != null ? String(authUser.userId) : null;
                                            if (!myId) return;
                                            if (checked) {
                                                // Garante que meu usuário está presente sem duplicar
                                                setSelectedUserIds((prev) => Array.from(new Set([...(prev || []), myId])));
                                            } else {
                                                // Remove meu usuário da seleção
                                                setSelectedUserIds((prev) => (prev || []).filter((id) => id !== myId));
                                            }
                                        }}
                                    />
                                }
                                label="Incluir meu usuário"
                            />
                        </Box>
                        <Box sx={{ mt: 1 }}>
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                options={usersOptions || []}
                                loading={usersLoading}
                                getOptionLabel={(u) => `${u?.nome || u?.name || ''}${u?.setor ? ` - ${u.setor}` : ''}`}
                                value={(usersOptions || []).filter((u) => selectedUserIds.includes(String(u.userid || u.id)))}
                                filterOptions={(options, params) => {
                                    const input = (params.inputValue || '').trim();
                                    if (input.length < 1) return [];
                                    const defaultFilter = createFilterOptions();
                                    const filtered = defaultFilter(options, params);
                                    // Remove usuários já selecionados da lista de opções
                                    return filtered.filter((u) => !selectedUserIds.includes(String(u.userid || u.id)));
                                }}
                                renderTags={() => null}
                                noOptionsText=""
                                onChange={(event, values) => {
                                    const ids = values.map((u) => String(u.userid || u.id));
                                    const myId = authUser?.userId != null ? String(authUser.userId) : null;
                                    const finalArr = includeMe && myId ? Array.from(new Set([...ids, myId])) : ids;
                                    setSelectedUserIds(finalArr);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Buscar usuários (Nome - Setor)"
                                        placeholder="Digite para buscar..."
                                    />
                                )}
                            />
                            {!usersLoading && usersOptions && usersOptions.length === 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Nenhum usuário encontrado.
                                </Typography>
                            )}
                        </Box>
                        {selectedUserIds && selectedUserIds.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Usuários selecionados:</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedUserIds.map((id) => {
                                        const u = usersOptions.find((x) => String(x.userid || x.id) === String(id));
                                        const label = u ? `${u.nome || u.name}${u.setor ? ` - ${u.setor}` : ''}` : id;
                                        return (
                                            <Chip
                                                key={id}
                                                label={label}
                                                size="small"
                                                onDelete={() => {
                                                    const myId = authUser?.userId != null ? String(authUser.userId) : null;
                                                    setSelectedUserIds((prev) => (prev || []).filter((x) => String(x) !== String(id)));
                                                    if (myId && String(id) === myId) {
                                                        setIncludeMe(false);
                                                    }
                                                }}
                                                deleteIcon={<CancelIcon fontSize="small" />}
                                            />
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                        {selectedTrip && (
                            <Box sx={{ mt: 2, color: 'text.secondary' }}>
                                <Typography variant="body2">
                                    Viagem selecionada: #{selectedTrip.tripid} - {selectedTrip.origem || 'Origem N/A'} → {selectedTrip.destino_completo || 'Destino N/A'}
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Motivo da Carona"
                                value={caronaMotivo}
                                onChange={(e) => setCaronaMotivo(e.target.value)}
                                multiline
                                minRows={2}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setSelectUserOpen(false); setSelectedUserIds([]); setCaronaMotivo(''); }}>Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={async () => {
                                if (!selectedTrip?.tripid || !selectedUserIds || selectedUserIds.length === 0 || isSavingCarona) return;
                                try {
                                    setIsSavingCarona(true);
                                    await api.post('/caronas', {
                                        viagemId: selectedTrip.tripid,
                                        requisitantes: selectedUserIds.map((id) => Number(id)),
                                        motivo: caronaMotivo || null
                                    });
                                    console.log('Caronas gravadas com sucesso');
                                    setSelectUserOpen(false);
                                    setSelectedUserIds([]);
                                    setCaronaMotivo('');
                                    setSnackbar({ open: true, message: 'Carona solicitada com sucesso!', severity: 'success' });
                                } catch (err) {
                                    console.error('Erro ao salvar caronas:', err);
                                    setSnackbar({ open: true, message: err.response?.data?.message || 'Erro ao solicitar carona', severity: 'error' });
                                } finally {
                                    setIsSavingCarona(false);
                                }
                            }}
                            disabled={!selectedUserIds || selectedUserIds.length === 0 || !caronaMotivo.trim() || isSavingCarona}
                        >
                            {isSavingCarona ? 'Salvando...' : 'Confirmar'}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={15000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <MuiAlert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} elevation={6} variant="filled">
                        {snackbar.severity === 'warning' && typeof snackbar.message === 'string' && snackbar.message.startsWith('Antes de solicitar uma nova viagem') ? (
                            <>
                                Antes de solicitar uma nova viagem, é necessário avaliar sua última experiência. Acesse <RouterLink to="/minhasviagens" style={{ color: 'inherit', textDecoration: 'underline' }}>Minhas Viagens</RouterLink> e conclua a avaliação.
                            </>
                        ) : (
                            snackbar.message
                        )}
                    </MuiAlert>
                </Snackbar>
            </Paper>
        </Container>
    );
};

export default TripListPage;
