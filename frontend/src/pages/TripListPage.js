import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
    Container, Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, IconButton,
    Avatar, Stack, Chip, Tooltip, useTheme, TextField, FormControl, InputLabel, Select, MenuItem,
    Grid, TablePagination
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const TripListPage = () => {
    const theme = useTheme();
    const [trips, setTrips] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(6);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    
    // Estados dos filtros
    const [filters, setFilters] = useState({
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
            const matchDestino = !filters.destino || trip.destino_completo?.toLowerCase().includes(filters.destino.toLowerCase());
            const matchSolicitante = !filters.solicitante || trip.solicitante_nome?.toLowerCase().includes(filters.solicitante.toLowerCase());
            const matchDataSaida = !filters.dataSaida || trip.data_saida?.includes(filters.dataSaida);
            const matchDataRetorno = !filters.dataRetorno || trip.data_retorno_prevista?.includes(filters.dataRetorno);
            const matchStatus = !filters.status || trip.status_viagem?.toLowerCase() === filters.status.toLowerCase();
            const matchVeiculo = !filters.veiculo || 
                (trip.veiculo_alocado_modelo?.toLowerCase().includes(filters.veiculo.toLowerCase()) ||
                trip.veiculo_alocado_placa?.toLowerCase().includes(filters.veiculo.toLowerCase()));
            const matchMotorista = !filters.motorista || trip.motorista_nome?.toLowerCase().includes(filters.motorista.toLowerCase());
            const matchTextoGeral = !filters.textoGeral || 
                trip.finalidade?.toLowerCase().includes(filters.textoGeral.toLowerCase()) ||
                trip.observacoes?.toLowerCase().includes(filters.textoGeral.toLowerCase());

            return matchDestino && matchSolicitante && matchDataSaida && matchDataRetorno && 
                   matchStatus && matchVeiculo && matchMotorista && matchTextoGeral;
        });

        setFilteredTrips(filtered);
    }, [trips, filters]);

    useEffect(() => {
        applyFilters();
    }, [filters, trips, applyFilters]);

    const fetchTrips = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/trips');
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
                return { color: 'warning', icon: <HelpOutlineIcon /> };
            case 'Aprovada':
                return { color: 'success', icon: <CheckCircleIcon /> };
            case 'Agendada':
                return { color: 'warning', icon: <EventIcon /> };
            case 'Em Andamento':
                return { color: 'info', icon: <AccessTimeIcon /> };
            case 'Concluida':
                return { color: 'success', icon: <TaskAltIcon /> };
            case 'Recusada':
                return { color: 'error', icon: <CancelIcon /> };
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
                    <Typography variant="h4" component="h1" sx={{ fontFamily: "'Exo 2', sans-serif" }}>
                        Painel de Viagens
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to="/registrar-viagem"
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ fontFamily: "'Exo 2', sans-serif" }}
                    >
                        Registrar Nova Viagem
                    </Button>
                </Box>

                {/* Barra de Filtros */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        mb: 3,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.grey[200]}`
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        gap: 1
                    }}>
                        <FilterAltIcon sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            Filtrar Viagens
                        </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }} columns={12}>
                        <Grid item xs={12} sm={6} md={4} lg={2}>
                            <TextField
                                fullWidth
                                label="Destino"
                                value={filters.destino}
                                onChange={(e) => handleFilterChange('destino', e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <PlaceIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2}>
                            <TextField
                                fullWidth
                                label="Solicitante"
                                value={filters.solicitante}
                                onChange={(e) => handleFilterChange('solicitante', e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Data Saída"
                                value={filters.dataSaida}
                                onChange={(e) => handleFilterChange('dataSaida', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <EventIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Data Retorno"
                                value={filters.dataRetorno}
                                onChange={(e) => handleFilterChange('dataRetorno', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <EventIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    label="Status"
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    startAdornment={
                                        <FlagIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    }
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="Pendente">Pendente</MenuItem>
                                    <MenuItem value="Aprovada">Aprovada</MenuItem>
                                    <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                                    <MenuItem value="Concluída">Concluída</MenuItem>
                                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2}>
                            <TextField
                                fullWidth
                                label="Veículo"
                                value={filters.veiculo}
                                onChange={(e) => handleFilterChange('veiculo', e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <DirectionsCarIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    ),
                                }}
                            />
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
                                        padding: '8px 16px'
                                    }}
                                >Status</TableCell>
                                <TableCell 
                                    sx={{ 
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        py: 1,
                                        px: 2
                                    }}
                                >Destino</TableCell>
                                <TableCell 
                                    sx={{ 
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        py: 1,
                                        px: 2
                                    }}
                                >Solicitante</TableCell>
                                <TableCell 
                                    sx={{ 
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        py: 1,
                                        px: 2
                                    }}
                                >Data Saída</TableCell>
                                <TableCell 
                                    sx={{ 
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        py: 1,
                                        px: 2
                                    }}
                                >Data Retorno</TableCell>
                                <TableCell 
                                    sx={{ 
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        py: 1,
                                        px: 2
                                    }}
                                >Veículo</TableCell>
                                <TableCell 
                                    sx={{ 
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        py: 1,
                                        px: 2
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
                                        px: 2
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
                                    <TableCell sx={{ py: 1, px: 2 }}>
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
                                    <TableCell sx={{ py: 1, px: 2 }}>{trip.destino_completo}</TableCell>
                                    <TableCell sx={{ py: 1, px: 2 }}>
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
                                    <TableCell sx={{ py: 1, px: 2 }}>{formatDate(trip.data_saida)}</TableCell>
                                    <TableCell sx={{ py: 1, px: 2 }}>{formatDate(trip.data_retorno_prevista)}</TableCell>
                                    <TableCell sx={{ py: 1, px: 2 }}>
                                        {trip.veiculo_alocado_modelo} 
                                        {trip.veiculo_alocado_placa && 
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                {trip.veiculo_alocado_placa}
                                            </Typography>
                                        }
                                    </TableCell>
                                    <TableCell sx={{ py: 1, px: 2 }}>
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
                                    <TableCell align="right" sx={{ py: 1, px: 2 }}>
                                        <Tooltip title="Ver Detalhes">
                                            <IconButton
                                                component={RouterLink}
                                                to={`/viagens/${trip.tripid}`}
                                                size="small"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
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
            </Paper>
        </Container>
    );
};

export default TripListPage;
