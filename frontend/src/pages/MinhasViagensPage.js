import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  IconButton,
  TablePagination,
  useTheme,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import { Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MinhasViagensPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.get('/trips');
      setTrips(resp.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao buscar viagens.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const minhasTrips = useMemo(() => {
    const uid = user?.userId;
    if (!uid) return [];
    return (trips || []).filter(t => Number(t.solicitante_usuarioid) === Number(uid));
  }, [trips, user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      .toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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
        return { color: 'success', icon: <TaskAltIcon /> };
      case 'Cancelada':
        return { color: 'error', icon: <CancelIcon /> };
      default:
        return { color: 'default', icon: <HelpOutlineIcon /> };
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, textAlign: 'left' }}>
            Minhas Viagens
          </Typography>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 800, backgroundColor: theme.palette.background.paper }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Status</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Destino</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Data Saída</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Data Retorno</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Veículo</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Motorista</TableCell>
                  <TableCell align="right" sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {minhasTrips
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((trip) => (
                    <TableRow key={trip.tripid}>
                      <TableCell>
                        <Chip
                          label={trip.status_viagem}
                          color={getStatusColor(trip.status_viagem).color}
                          size="small"
                          icon={getStatusColor(trip.status_viagem).icon}
                        />
                      </TableCell>
                      <TableCell>{trip.destino_completo}</TableCell>
                      <TableCell>{formatDate(trip.data_saida)}</TableCell>
                      <TableCell>{formatDate(trip.data_retorno_prevista)}</TableCell>
                      <TableCell>
                        {trip.veiculo_alocado_modelo}
                        {trip.veiculo_alocado_placa && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {trip.veiculo_alocado_placa}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {trip.motorista_nome ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={trip.motorista_avatar ? `http://10.1.1.42:3001${trip.motorista_avatar}` : undefined}
                              sx={{ width: 32, height: 32, border: '2px solid', borderColor: 'primary.main' }}
                            >
                              {trip.motorista_nome.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{trip.motorista_nome}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.disabled' }}>Não alocado</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
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
            count={minhasTrips.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            rowsPerPageOptions={[6, 12, 24, 48]}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default MinhasViagensPage;
