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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: "'Exo 2', sans-serif" }}>
            Lista de Veículos
          </Typography>
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
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead sx={{ backgroundColor: 'grey.200' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Placa</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Marca</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Modelo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ano</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow
                    key={vehicle.veiculoid}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'grey.100'} }}
                  >
                    <TableCell component="th" scope="row">{vehicle.placa}</TableCell>
                    <TableCell>{vehicle.marca}</TableCell>
                    <TableCell>{vehicle.modelo}</TableCell>
                    <TableCell>{vehicle.ano}</TableCell>
                    <TableCell>{vehicle.tipo}</TableCell>
                    <TableCell>{vehicle.status && vehicle.status.toLowerCase() === 'inativo' ? 'Indisponível' : vehicle.status}</TableCell>
                    <TableCell align="right">
                      <IconButton component={Link} to={`/editar-veiculo/${vehicle.veiculoid}`} color="primary" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      {/* Botão de deletar removido */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default VehicleListPage;
