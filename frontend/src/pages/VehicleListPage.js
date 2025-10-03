import React, { useState, useEffect } from 'react';
import { getVehicles } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [deleteError, setDeleteError] = useState(null); // Removido
  // const [deleteSuccess, setDeleteSuccess] = useState(null); // Removido

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      // setDeleteError(null); // Removido
      // setDeleteSuccess(null); // Removido
      const data = await getVehicles();
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar veículos.');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{
            fontWeight: 'bold',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <DirectionsCarIcon sx={{ fontSize: '2rem' }} />
            Painel de Veículos
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/cadastrar-veiculo"
              startIcon={<AddIcon />}
            >
              Novo Veículo
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {/* {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>} Removido */}
          {/* {deleteSuccess && <Alert severity="success" sx={{ mb: 2 }}>{deleteSuccess}</Alert>} Removido */}

          {vehicles.length === 0 && !error ? (
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Nenhum veículo cadastrado.
            </Typography>
          ) : !error && (
            <TableContainer component={Paper} elevation={3}>
              <Table 
                size="small"
                sx={{ 
                  minWidth: 800,
                  backgroundColor: '#fff',
                  '& .MuiTableCell-root': {
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    padding: '8px 16px'
                  }
                }}
                aria-label="vehicle table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 140 }}>Placa</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 160 }}>Marca</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 180 }}>Modelo</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 100 }}>Ano</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 140 }}>Tipo</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 140 }}>Status</TableCell>
                    <TableCell align="right" sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', width: 90 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow
                      key={vehicle.veiculoid}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'grey.100'} }}
                    >
                      <TableCell component="th" scope="row" sx={{ whiteSpace:'nowrap', maxWidth: 140 }}>{vehicle.placa}</TableCell>
                      <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 160 }}>{vehicle.marca}</TableCell>
                      <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 180 }}>{vehicle.modelo}</TableCell>
                      <TableCell sx={{ whiteSpace:'nowrap', width: 100 }}>{vehicle.ano}</TableCell>
                      <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 140 }}>{vehicle.tipo}</TableCell>
                      <TableCell sx={{ whiteSpace:'nowrap', maxWidth: 140 }}>{vehicle.status}</TableCell>
                      <TableCell align="right">
                        <IconButton component={Link} to={`/editar-veiculo/${vehicle.veiculoid}`} color="primary" aria-label="edit">
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default VehicleListPage;
