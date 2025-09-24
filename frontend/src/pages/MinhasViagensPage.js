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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
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
  const [actionOpen, setActionOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripRating, setTripRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [vehicleRating, setVehicleRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [myEvaluations, setMyEvaluations] = useState({}); // { [tripid]: {trip_rating, driver_rating, ...} }
  const [readOnlyEval, setReadOnlyEval] = useState(false);
  const isFormValid = tripRating > 0 && driverRating > 0 && vehicleRating > 0;

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

  // Fetch current user's evaluations once
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const resp = await api.get('/evaluations');
        const all = resp.data?.evaluations || [];
        const mine = all.filter((e) => String(e.user_id) === String(user?.userId));
        const map = {};
        mine.forEach((e) => { map[String(e.tripid)] = e; });
        setMyEvaluations(map);
      } catch (err) {
        // silencioso
      }
    };
    fetchEvaluations();
  }, [user]);

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
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsCarIcon sx={{ fontSize: '2rem' }} />
            Minhas Viagens
          </Typography>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 800, backgroundColor: theme.palette.background.paper }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 90 }}>ID</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 110 }}>Status</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Origem</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Destino</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 120 }}>Data Saída</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 120 }}>Data Retorno</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Veículo</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Motorista</TableCell>
                  <TableCell align="right" sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 90 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {minhasTrips
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((trip) => (
                    <TableRow key={trip.tripid}>
                      <TableCell sx={{ py: 1, px: 2, whiteSpace: 'nowrap', width: 90 }}>#{trip.tripid}</TableCell>
                      <TableCell sx={{ py: 1, px: 2, width: 110 }}>
                        <Chip
                          label={trip.status_viagem}
                          color={getStatusColor(trip.status_viagem).color}
                          size="small"
                          icon={getStatusColor(trip.status_viagem).icon}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 2, maxWidth: 160, whiteSpace: 'nowrap' }}>{trip.origem || trip.origem_completa || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 1, px: 2, maxWidth: 160, whiteSpace: 'nowrap' }}>{trip.destino_completo}</TableCell>
                      <TableCell sx={{ py: 1, px: 2, maxWidth: 120, whiteSpace: 'nowrap' }}>{formatDate(trip.data_saida)}</TableCell>
                      <TableCell sx={{ py: 1, px: 2, maxWidth: 120, whiteSpace: 'nowrap' }}>{formatDate(trip.data_retorno_prevista)}</TableCell>
                      <TableCell sx={{ py: 1, px: 2, maxWidth: 160 }}>
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
                      <TableCell align="right" sx={{ py: 1, px: 2, width: 90 }}>
                        {(() => {
                          const evalForTrip = myEvaluations[String(trip.tripid)];
                          const alreadyEvaluated = Boolean(evalForTrip);
                          const canEvaluate = !alreadyEvaluated && String(trip.status_viagem || '').toLowerCase() === 'concluida';
                          const tooltipText = alreadyEvaluated
                            ? `Sua avaliação — Viagem: ${evalForTrip.trip_rating}/5, Motorista: ${evalForTrip.driver_rating}/5 (clique para ver)`
                            : (canEvaluate ? 'Avaliar viagem' : 'Disponível após conclusão da viagem');
                          return (
                            <Tooltip title={tooltipText}>
                              <span>
                                <IconButton 
                                  size="small" 
                                  color={alreadyEvaluated ? 'success' : (canEvaluate ? 'warning' : 'default')} 
                                  onClick={() => {
                                    const evalForTrip = myEvaluations[String(trip.tripid)];
                                    if (canEvaluate) {
                                      setSelectedTrip(trip);
                                      setTripRating(0);
                                      setDriverRating(0);
                                      setFeedbackText('');
                                      setVehicleRating(0);
                                      setReadOnlyEval(false);
                                      setActionOpen(true);
                                    } else if (evalForTrip) {
                                      // abrir em modo somente leitura com os dados já enviados
                                      setSelectedTrip(trip);
                                      setTripRating(Number(evalForTrip.trip_rating) || 0);
                                      setDriverRating(Number(evalForTrip.driver_rating) || 0);
                                      setVehicleRating(Number(evalForTrip.vehicle_rating) || 0);
                                      setFeedbackText(evalForTrip.feedback || '');
                                      setReadOnlyEval(true);
                                      setActionOpen(true);
                                    }
                                  }}
                                  disabled={!canEvaluate && !alreadyEvaluated}
                                >
                                  {alreadyEvaluated ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          );
                        })()}
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

      {/* Modal de Ações (vazio por enquanto) */}
      <Dialog open={actionOpen} onClose={() => setActionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{readOnlyEval ? 'Sua avaliação' : 'Avalie essa viagem'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>Avalie a viagem (1 a 5) *</Typography>
              <Rating
                name="trip-rating"
                value={tripRating}
                onChange={(e, newValue) => !readOnlyEval && setTripRating(newValue || 0)}
                max={5}
                readOnly={readOnlyEval}
              />
              {!readOnlyEval && tripRating === 0 && (
                <Typography variant="caption" color="error">Campo obrigatório</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>Avalie o motorista (1 a 5) *</Typography>
              <Rating
                name="driver-rating"
                value={driverRating}
                onChange={(e, newValue) => !readOnlyEval && setDriverRating(newValue || 0)}
                max={5}
                readOnly={readOnlyEval}
              />
              {!readOnlyEval && driverRating === 0 && (
                <Typography variant="caption" color="error">Campo obrigatório</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>Avalie as condições do veículo (1 a 5) *</Typography>
              <Rating
                name="vehicle-rating"
                value={vehicleRating}
                onChange={(e, newValue) => !readOnlyEval && setVehicleRating(newValue || 0)}
                max={5}
                readOnly={readOnlyEval}
              />
              {!readOnlyEval && vehicleRating === 0 && (
                <Typography variant="caption" color="error">Campo obrigatório</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>Feedback</Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Escreva aqui suas sugestões ou reclamações..."
                value={feedbackText}
                onChange={(e) => !readOnlyEval && setFeedbackText(e.target.value)}
                InputProps={{ readOnly: readOnlyEval }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionOpen(false)} disabled={saving}>Fechar</Button>
          {!readOnlyEval && (
          <Tooltip title={isFormValid ? 'Enviar avaliação' : 'Preencha todas as avaliações obrigatórias'}>
          <span>
          <Button 
            variant="contained" 
            onClick={async () => {
              if (!selectedTrip) return;
              try {
                setSaving(true);
                const saveResp = await api.post('/evaluations', {
                  tripid: selectedTrip.tripid,
                  user_id: user?.userId,
                  user_name: user?.nome,
                  user_setor: user?.setor || user?.departamento || user?.department || user?.setor_nome || '',
                  trip_rating: tripRating,
                  driver_rating: driverRating,
                  vehicle_rating: vehicleRating,
                  feedback: feedbackText
                });
                setSnackbar({ open: true, message: 'Avaliação enviada com sucesso!', severity: 'success' });
                // Atualizar cache local de avaliações para refletir imediatamente
                setMyEvaluations(prev => ({
                  ...prev,
                  [String(selectedTrip.tripid)]: saveResp.data?.evaluation || {
                    tripid: selectedTrip.tripid,
                    user_id: user?.userId,
                    user_name: user?.nome,
                    user_setor: user?.setor || user?.departamento || user?.department || user?.setor_nome || '',
                    trip_rating: tripRating,
                    driver_rating: driverRating,
                    vehicle_rating: vehicleRating,
                    feedback: feedbackText
                  }
                }));
                setActionOpen(false);
              } catch (err) {
                setSnackbar({ open: true, message: err.response?.data?.error || 'Falha ao enviar avaliação', severity: 'error' });
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || !selectedTrip || !isFormValid}
          >
            {saving ? 'Enviando...' : 'Enviar avaliação'}
          </Button>
          </span>
          </Tooltip>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default MinhasViagensPage;
