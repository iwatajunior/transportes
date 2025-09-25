import React, { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Box, Button, Grid, Link as RouterLink, Paper, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Tooltip, IconButton, Avatar, Collapse } from '@mui/material';
import { Pagination } from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Dashboard as DashboardIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  DirectionsBus as BusIcon,
  Edit as EditIcon,
  LocationOn,
  ArrowForward,
  ArrowBack,
  Send as SendIcon,
  Luggage as LuggageIcon,
  Poll as PollIcon
} from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import PlaceIcon from '@mui/icons-material/Place';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { useTheme } from '@mui/material/styles';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RouteMap from '../components/RouteMap';
import api from '../services/api';
import { cidadesPI } from '../services/cidadesPI';

const BUTTON_COLOR = '#FFA500';

const HomeSandboxPage = () => {
  const { user } = useAuth();
  const history = useHistory();
  const theme = useTheme();
  const [rotas, setRotas] = useState([]);
  const [rotasFiltradas, setRotasFiltradas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Trips table state
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    origem: '',
    destino: '',
    solicitante: '',
    dataSaida: '',
    dataRetorno: '',
    status: '',
    veiculo: '',
    motorista: ''
  });
  const [showTestArea, setShowTestArea] = useState(false);
  const [stickyNote, setStickyNote] = useState('');
  const [calendarDate, setCalendarDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openEncomendaDialog, setOpenEncomendaDialog] = useState(false);
  const [selectedRota, setSelectedRota] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('');
  const [materialInfo, setMaterialInfo] = useState({
    tipo: '',
    quantidade: '',
    observacoes: '',
    cidade_destino: ''
  });

  useEffect(() => {
    const fetchRotas = async () => {
      try {
        setLoading(true);
        const response = await api.get('/routes?home=true');
        const rotasData = response.data || [];
        if (!rotasData || !Array.isArray(rotasData)) {
          console.error('Resposta inválida da API:', rotasData);
          throw new Error('Resposta inválida da API');
        }
        const rotasFiltradas = rotasData
          .sort((a, b) => {
            const statusOrder = { 
              'agendada': 1, 
              'andamento': 2,
              'concluida': 3,
              'cancelada': 4
            };
            const statusA = statusOrder[a.status.toLowerCase()] || 99;
            const statusB = statusOrder[b.status.toLowerCase()] || 99;
            return statusA - statusB;
          });
        setRotas(rotasData);
        setRotasFiltradas(rotasFiltradas);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar rotas:', err);
        setError('Erro ao carregar rotas');
        setLoading(false);
      }
    };

    fetchRotas();
  }, []);

  // Persist and restore sticky note content
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sandboxStickyNote');
      if (saved) setStickyNote(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('sandboxStickyNote', stickyNote || '');
    } catch {}
  }, [stickyNote]);

  // Calendar helpers
  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
  const getMondayBasedWeekday = (jsDay) => (jsDay + 6) % 7; // convert Sun(0)..Sat(6) -> Mon(0)..Sun(6)
  const getCalendarCells = (d) => {
    const first = startOfMonth(d);
    const last = endOfMonth(d);
    const leading = getMondayBasedWeekday(first.getDay());
    const totalDays = last.getDate();
    const cells = [];
    // Fill 42 cells (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayNum = i - leading + 1;
      const cellDate = new Date(d.getFullYear(), d.getMonth(), dayNum);
      const inMonth = dayNum >= 1 && dayNum <= totalDays;
      cells.push({ inMonth, day: cellDate.getDate(), date: cellDate });
    }
    return cells;
  };
  const handlePrevMonth = () => setCalendarDate((prev) => addMonths(prev, -1));
  const handleNextMonth = () => setCalendarDate((prev) => addMonths(prev, 1));

  // Build a set of YYYY-MM-DD for days that have trips (based on data_saida)
  const toDateKey = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
      const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (m) return m[1];
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const mth = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${mth}-${day}`;
  };
  const markedDays = useMemo(() => {
    const s = new Set();
    (filteredTrips || []).forEach((t) => {
      const startStr = toDateKey(t.data_saida);
      const endStr = toDateKey(t.data_retorno_prevista || t.data_saida);
      if (!startStr) return;
      const [sy, sm, sd] = startStr.split('-').map(Number);
      const [ey, em, ed] = endStr.split('-').map(Number);
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      if (isNaN(start.getTime())) return;
      if (isNaN(end.getTime()) || end < start) {
        s.add(startStr);
        return;
      }
      const cur = new Date(start);
      while (cur <= end) {
        const y = cur.getFullYear();
        const mth = String(cur.getMonth() + 1).padStart(2, '0');
        const day = String(cur.getDate()).padStart(2, '0');
        s.add(`${y}-${mth}-${day}`);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return s;
  }, [filteredTrips]);

  // Today key for highlighting current day
  const todayKey = useMemo(() => {
    const now = new Date();
    now.setHours(0,0,0,0);
    const y = now.getFullYear();
    const mth = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${y}-${mth}-${day}`;
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      setTripsLoading(true);
      setTripsError('');
      try {
        const response = await api.get('/trips');
        const data = response.data || [];
        setTrips(data);
        setFilteredTrips(data);
      } catch (err) {
        setTripsError(err.response?.data?.message || 'Falha ao buscar viagens.');
      } finally {
        setTripsLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // Apply filters whenever filters or trips change
  useEffect(() => {
    const apply = () => {
      const filtered = (trips || []).filter((trip) => {
        const origemStr = (trip.origem || trip.origem_completo || '').toLowerCase();
        const destinoStr = (trip.destino_completo || '').toLowerCase();
        const solicitanteStr = (trip.solicitante_nome || '').toLowerCase();
        const motoristaStr = (trip.motorista_nome || '').toLowerCase();
        const veiculoStr = ((trip.veiculo_alocado_modelo || '') + ' ' + (trip.veiculo_alocado_placa || '')).toLowerCase();
        const statusStr = (trip.status_viagem || '').toLowerCase();

        const matchOrigem = !filters.origem || origemStr.includes(filters.origem.toLowerCase());
        const matchDestino = !filters.destino || destinoStr.includes(filters.destino.toLowerCase());
        const matchSolicitante = !filters.solicitante || solicitanteStr.includes(filters.solicitante.toLowerCase());
        const matchMotorista = !filters.motorista || motoristaStr.includes(filters.motorista.toLowerCase());
        const matchVeiculo = !filters.veiculo || veiculoStr.includes(filters.veiculo.toLowerCase());
        const matchStatus = !filters.status || statusStr === filters.status.toLowerCase();
        const matchDataSaida = !filters.dataSaida || (trip.data_saida || '').includes(filters.dataSaida);
        const matchDataRetorno = !filters.dataRetorno || (trip.data_retorno_prevista || '').includes(filters.dataRetorno);

        return matchOrigem && matchDestino && matchSolicitante && matchMotorista && matchVeiculo && matchStatus && matchDataSaida && matchDataRetorno;
      });
      setFilteredTrips(filtered);
      setPage(0);
    };
    apply();
  }, [filters, trips]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };
  const clearFilters = () => {
    setFilters({
      origem: '', destino: '', solicitante: '', dataSaida: '', dataRetorno: '', status: '', veiculo: '', motorista: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      .toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };
  const formatTime = (value) => {
    if (!value) return '--:--';
    if (typeof value === 'string') {
      const match = value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
      if (match) return `${match[1]}:${match[2]}h`;
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return '--:--';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}h`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente':
        return { color: 'default', icon: <HelpOutlineIcon /> };
      case 'Agendada':
        return { color: 'warning', icon: <EventIcon /> };
      case 'Andamento':
        return { color: 'primary', icon: <AccessTimeIcon /> };
      case 'Concluida':
      case 'Concluída':
        return { color: 'success', icon: <TaskAltIcon /> };
      case 'Cancelada':
        return { color: 'error', icon: <CancelIcon /> };
      default:
        return { color: 'default', icon: <HelpOutlineIcon /> };
    }
  };

  const getCidadeNome = (id) => {
    const cidade = cidadesPI.find(c => String(c.id) === String(id));
    return cidade ? cidade.nome : id;
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEncomendaClick = () => {
    setOpenEncomendaDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEncomendaDialog(false);
    setSelectedRota(null);
    setSelectedCidade('');
    setMaterialInfo({
      tipo: '',
      quantidade: '',
      observacoes: '',
      cidade_destino: ''
    });
  };

  const handleRotaChange = (event) => {
    setSelectedRota(event.target.value);
    setSelectedCidade('');
  };

  const handleCidadeChange = (event) => {
    setSelectedCidade(event.target.value);
  };

  const handleMaterialChange = (event) => {
    setMaterialInfo({
      ...materialInfo,
      [event.target.name]: event.target.value
    });
  };

  const handleConfirmarEncomenda = async () => {
    try {
      if (!selectedRota || !selectedCidade || !materialInfo.cidade_destino || !materialInfo.tipo || !materialInfo.quantidade) {
        setSnackbar({
          open: true,
          message: 'Por favor, preencha todos os campos obrigatórios',
          severity: 'warning'
        });
        return;
      }

      const response = await api.post('/materials', {
        rota_id: selectedRota.id,
        cidade_origem_id: selectedRota.cidade_origem,
        cidade_destino_id: materialInfo.cidade_destino,
        tipo: materialInfo.tipo,
        quantidade: parseFloat(materialInfo.quantidade),
        observacoes: materialInfo.observacoes || '',
        user_id: user.userId
      });

      if (response.status === 201) {
        setSnackbar({ 
          open: true, 
          message: 'Material registrado com sucesso!', 
          severity: 'success' 
        });
        handleDialogClose();
      }
    } catch (error) {
      console.error('Erro ao registrar material:', error);
      setSnackbar({ 
        open: true, 
        message: 'Erro ao registrar material: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'), 
        severity: 'error' 
      });
    }
  };

  const isFormValid = () => {
    const isValid = selectedCidade && 
                   materialInfo.tipo && 
                   materialInfo.quantidade && 
                   materialInfo.cidade_destino;
    return isValid;
  };

  const handleInteresseClick = (rota) => {
    setSelectedRota(rota);
    setSelectedCidade('');
    setMaterialInfo({
      tipo: '',
      quantidade: '',
      observacoes: '',
      cidade_destino: ''
    });
    setOpenEncomendaDialog(true);
  };

  const getCidadesRota = (rota) => {
    if (!rota) return [];
    const cidadesRota = [
      { id: rota.cidade_origem, nome: getCidadeNome(rota.cidade_origem) },
      ...((rota.cidades_intermediarias_ida || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) }))),
      { id: rota.cidade_destino, nome: getCidadeNome(rota.cidade_destino) },
      ...((rota.cidades_intermediarias_volta || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) })))
    ];
    return cidadesRota.filter((c, idx, arr) => arr.findIndex(x => x.id === c.id) === idx);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando rotas...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 0, mt: -2 }}>
      <Container maxWidth="lg" sx={{ py: 0, px: 0 }}>
        {/* Sticky banner inside the page content (below global logo/header) */}
        <Box sx={{ mb: 1, position: 'sticky', top: { xs: 56, sm: 64 } }}>
          <Alert severity="error" variant="filled" sx={{ fontWeight: 700, borderRadius: 0, textAlign: 'center' }}>
            Ambiente de Teste
          </Alert>
        </Box>

        {/* Área de Testes (colapsável) - movida para o topo */}
        <Paper elevation={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Área de Testes</Typography>
            <Button size="small" onClick={() => setShowTestArea((v) => !v)}>
              {showTestArea ? 'Ocultar' : 'Mostrar'}
            </Button>
          </Box>
          <Collapse in={showTestArea}>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      height: 180,
                      bgcolor: '#FFF59D',
                      backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 24px)',
                      boxShadow: 1,
                      borderColor: '#FDD835'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                      Nota (Avisos)
                    </Typography>
                    <TextField
                      value={stickyNote}
                      onChange={(e) => setStickyNote(e.target.value)}
                      placeholder="Escreva aqui seus avisos..."
                      multiline
                      minRows={5}
                      fullWidth
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{
                        fontFamily: 'inherit',
                        '& textarea': { fontSize: '0.95rem', lineHeight: 1.4 },
                        bgcolor: 'transparent'
                      }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <IconButton size="small" onClick={handlePrevMonth} aria-label="Mês anterior">
                        <ArrowBack fontSize="small" />
                      </IconButton>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {calendarDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </Typography>
                      <IconButton size="small" onClick={handleNextMonth} aria-label="Próximo mês">
                        <ArrowForward fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box>
                      <Grid container columns={7} spacing={0.5} sx={{ mb: 0.5 }}>
                        {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((w) => (
                          <Grid item xs={1} key={w}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{w}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                      <Grid container columns={7} spacing={0.5}>
                        {getCalendarCells(calendarDate).map((cell, idx) => {
                          const cellKey = toDateKey(cell.date);
                          const hasTrips = cell.inMonth && markedDays.has(cellKey);
                          const isToday = cell.inMonth && cellKey === todayKey;
                          return (
                            <Grid item xs={1} key={idx}>
                              <Box sx={{
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1,
                                position: 'relative',
                                bgcolor: hasTrips ? 'warning.light' : (cell.inMonth ? 'background.paper' : 'action.hover'),
                                color: cell.inMonth ? 'text.primary' : 'text.disabled',
                                border: isToday ? 2 : 1,
                                borderColor: isToday ? 'primary.main' : (hasTrips ? 'warning.main' : 'divider')
                              }}>
                                <Typography variant="caption" sx={{ fontWeight: hasTrips ? 700 : 400 }}>
                                  {cell.day}
                                </Typography>
                                {hasTrips && (
                                  <Box sx={{
                                    position: 'absolute',
                                    bottom: 3,
                                    right: 3,
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: 'warning.main'
                                  }} />
                                )}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2, height: 120 }}>Card Placeholder 3</Paper>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>
        <Box sx={{ textAlign: 'center', mb: -1 }}>
          <Typography variant="h5" component="h1" sx={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 'bold', color: '#1976d2', mb: -0.5, textAlign: 'left' }}>
            {user?.nome ? `Bem-vindo, ${user.nome}!` : 'Bem-vindo ao Rotas e Viagens!'}
            <Typography variant="subtitle1" sx={{ fontFamily: "'Exo 2', sans-serif", color: 'text.secondary', display: 'inline', ml: 1 }}>
              Gerencie aqui suas viagens e encomendas.
            </Typography>
          </Typography>
        </Box>
        <Box sx={{ height: '15px' }} />

        {/* Filtros - Viagens (Teste) */}
        <Paper elevation={0} sx={{ p: 1, mb: 1.5, border: (theme) => `1px solid ${theme.palette.grey[200]}`, borderRadius: 1 }}>
          <Grid container spacing={1} columns={12} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Origem"
                value={filters.origem}
                onChange={(e) => handleFilterChange('origem', e.target.value)}
                size="small"
                InputProps={{ startAdornment: (<PlaceIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />) }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Destino"
                value={filters.destino}
                onChange={(e) => handleFilterChange('destino', e.target.value)}
                size="small"
                InputProps={{ startAdornment: (<PlaceIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />) }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Solicitante"
                value={filters.solicitante}
                onChange={(e) => handleFilterChange('solicitante', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Motorista"
                value={filters.motorista}
                onChange={(e) => handleFilterChange('motorista', e.target.value)}
                size="small"
                InputProps={{ startAdornment: (<PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />) }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Data Saída"
                value={filters.dataSaida}
                onChange={(e) => handleFilterChange('dataSaida', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Data Retorno"
                value={filters.dataRetorno}
                onChange={(e) => handleFilterChange('dataRetorno', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Veículo"
                  value={filters.veiculo}
                  onChange={(e) => handleFilterChange('veiculo', e.target.value)}
                  size="small"
                  InputProps={{ startAdornment: (<DirectionsCarIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />) }}
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

        {/* Tabela de Viagens (Teste) */}
        <Paper elevation={3} sx={{ p: 1.5, backgroundColor: '#FFFFFF', borderRadius: 2, mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
              Painel de Viagens (Teste)
            </Typography>
          </Box>

          {tripsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : tripsError ? (
            <Alert severity="error">{tripsError}</Alert>
          ) : (
            <>
              <TableContainer>
                <Table size="small" sx={{
                  minWidth: 800,
                  backgroundColor: theme.palette.background.paper,
                  '& .MuiTableCell-root': {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    padding: '8px 16px'
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 40 }}>ID</TableCell>
                      <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 50 }}>Status</TableCell>
                      <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', py: 1, px: 2, width: 140 }}>Origem</TableCell>
                      <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', py: 1, px: 2, width: 140 }}>Destino</TableCell>
                      <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', py: 1, px: 2, width: 160 }}>Solicitante</TableCell>
                      <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', py: 1, px: 2, width: 90 }}>Data/Hora<br/>Saída</TableCell>
                      <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', py: 1, px: 2, width: 90 }}>Data/Hora<br/>Retorno</TableCell>
                      <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', py: 1, px: 2, width: 140 }}>Veículo</TableCell>
                      <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', py: 1, px: 2, width: 160 }}>Motorista</TableCell>
                      <TableCell align="right" sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', py: 1, px: 2, width: 64 }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTrips
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((trip) => (
                      <TableRow key={trip.tripid} sx={{
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                        '&:hover': { backgroundColor: theme.palette.action.selected },
                        '& td': { fontSize: '0.875rem', py: 1 }
                      }}>
                        <TableCell sx={{ py: 1, px: 2, whiteSpace: 'nowrap', width: 40 }}>#{trip.tripid}</TableCell>
                        <TableCell sx={{ py: 1, px: 2, width: 50 }}>
                          <Tooltip title={trip.status_viagem || 'Status'}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette[getStatusColor(trip.status_viagem).color]?.main }}>
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
                            <Avatar src={trip.solicitante_avatar ? `http://10.1.1.42:3001${trip.solicitante_avatar}` : undefined} sx={{ width: 32, height: 32, border: '2px solid', borderColor: 'primary.main' }}>
                              {trip.solicitante_nome?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', lineHeight: 1.2 }}>{trip.solicitante_nome}</Typography>
                              {trip.solicitante_departamento && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{trip.solicitante_departamento}</Typography>
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
                        <TableCell sx={{ py: 1, px: 2, maxWidth: 90, whiteSpace: 'nowrap' }}>
                          <Box>
                            <Typography variant="body2" noWrap>{formatDate(trip.data_retorno_prevista)}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>{formatTime(trip.horario_retorno_previsto)}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1, px: 2, maxWidth: 140 }}>
                          {trip.veiculo_alocado_modelo}
                          {trip.veiculo_alocado_placa && (
                            <Typography variant="caption" display="block" color="text.secondary">{trip.veiculo_alocado_placa}</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1, px: 2, maxWidth: 160 }}>
                          {trip.motorista_nome ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar src={trip.motorista_avatar ? `http://10.1.1.42:3001${trip.motorista_avatar}` : undefined} sx={{ width: 32, height: 32, border: '2px solid', borderColor: 'primary.main' }}>
                                {trip.motorista_nome.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', lineHeight: 1.2 }}>{trip.motorista_nome}</Typography>
                                {trip.motorista_categoria && (
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{trip.motorista_categoria}</Typography>
                                )}
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>Não alocado</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1, px: 2, width: 64 }}>
                          <Tooltip title="Ver Detalhes">
                            <IconButton component={RouterLink} to={`/viagens/${trip.tripid}`} size="small">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredTrips.length}
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
                sx={{ borderTop: 1, borderColor: 'divider' }}
              />
            </>
          )}
        </Paper>


        <RouteMap rotas={rotasFiltradas} currentPage={currentPage} itemsPerPage={itemsPerPage} />

        {rotasFiltradas.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Pagination
              count={Math.ceil(rotasFiltradas.length / itemsPerPage)}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  minWidth: 24,
                  fontSize: '0.875rem'
                },
                '& .MuiPaginationItem-page': {
                  padding: '0 4px'
                }
              }}
            />
          </Box>
        )}

        <Dialog open={openEncomendaDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon color="primary" />
              <Typography variant="h6">Enviar Material</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Rota: {selectedRota?.identificacao}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {getCidadeNome(selectedRota?.cidade_origem)} → {getCidadeNome(selectedRota?.cidade_destino)}
              </Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Rota</InputLabel>
                <Select
                  value={selectedRota?.id || ''}
                  onChange={(e) => {
                    const rota = rotas.find(r => r.id === e.target.value);
                    setSelectedRota(rota);
                    setSelectedCidade('');
                    setMaterialInfo({
                      tipo: '',
                      quantidade: '',
                      observacoes: '',
                      cidade_destino: ''
                    });
                  }}
                  label="Rota"
                >
                  {rotas.map((rota) => (
                    <MenuItem key={rota.id} value={rota.id}>
                      {rota.identificacao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cidade de Coleta do Material</InputLabel>
                <Select
                  value={selectedCidade}
                  onChange={e => setSelectedCidade(e.target.value)}
                  label="Cidade de Coleta do Material"
                >
                  {selectedRota && getCidadesRota(selectedRota).map(cidade => (
                    <MenuItem key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cidade de Destino do Material</InputLabel>
                <Select
                  value={materialInfo.cidade_destino}
                  onChange={e => setMaterialInfo({...materialInfo, cidade_destino: e.target.value})}
                  label="Cidade de Destino do Material"
                >
                  {selectedRota && getCidadesRota(selectedRota).map(cidade => (
                    <MenuItem key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField fullWidth label="Tipo de Material" value={materialInfo.tipo} onChange={(e) => setMaterialInfo({...materialInfo, tipo: e.target.value})} sx={{ mb: 2 }} />
              <TextField fullWidth label="Quantidade" type="number" value={materialInfo.quantidade} onChange={(e) => setMaterialInfo({...materialInfo, quantidade: e.target.value})} sx={{ mb: 2 }} />
              <TextField fullWidth label="Observações" multiline rows={3} value={materialInfo.observacoes} onChange={(e) => setMaterialInfo({...materialInfo, observacoes: e.target.value})} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancelar</Button>
            <Button onClick={handleConfirmarEncomenda} disabled={!isFormValid()} variant="contained">Confirmar Envio</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default HomeSandboxPage;
