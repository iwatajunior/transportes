import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Box,
  Avatar, Chip, Tooltip, useTheme, TablePagination, IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';

const TestePage = () => {
  const theme = useTheme();
  const { user: authUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/trips');
      setTrips(response.data || []);
    } catch (err) {
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
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Paper elevation={3} sx={{ p: 1.5, backgroundColor: '#FFFFFF', borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" sx={{ fontFamily: "'Exo 2', sans-serif" }}>
            Painel de Viagens (Teste)
          </Typography>
        </Box>

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
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 90 }}>ID</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 110 }}>Status</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Origem</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Destino</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 180 }}>Solicitante</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 120 }}>Data Saída</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 120 }}>Data Retorno</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Veículo</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Motorista</TableCell>
                <TableCell align="right" sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 90 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((trip) => (
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
                  <TableCell sx={{ py: 1, px: 2, whiteSpace: 'nowrap', width: 90 }}>#{trip.tripid}</TableCell>
                  <TableCell sx={{ py: 1, px: 2, width: 110 }}>
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
                  <TableCell sx={{ py: 1, px: 2, maxWidth: 160, whiteSpace: 'nowrap' }}>{trip.origem || trip.origem_completa || 'N/A'}</TableCell>
                  <TableCell sx={{ py: 1, px: 2, maxWidth: 160, whiteSpace: 'nowrap' }}>{trip.destino_completo}</TableCell>
                  <TableCell sx={{ py: 1, px: 2, maxWidth: 180 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={trip.solicitante_avatar ? `http://10.1.1.42:3001${trip.solicitante_avatar}` : undefined}
                        sx={{ 
                          width: 32, 
                          height: 32,
                          border: '2px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        {trip.solicitante_nome?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', lineHeight: 1.2 }}>
                          {trip.solicitante_nome}
                        </Typography>
                        {trip.solicitante_departamento && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {trip.solicitante_departamento}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
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
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', lineHeight: 1.2 }}>
                            {trip.motorista_nome}
                          </Typography>
                          {trip.motorista_categoria && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {trip.motorista_categoria}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }}>Não alocado</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2, width: 90 }}>
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
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </Paper>
    </Container>
  );
};

export default TestePage;
