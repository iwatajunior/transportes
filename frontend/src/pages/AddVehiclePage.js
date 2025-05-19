
import React from 'react';
import VehicleForm from '../components/vehicles/VehicleForm';
import { createVehicle } from '../services/api';
import { useHistory } from 'react-router-dom';
import { Container, Paper, Typography, Box, Alert } from '@mui/material'; // Adicionado Alert para futuro uso

const AddVehiclePage = () => {
  const history = useHistory();
  // Estados para feedback podem ser adicionados aqui se quisermos mover a lógica de alert para cá
  // const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(null);

  const handleFormSubmit = async (vehicleData) => {
    try {
      // setError(null); setSuccess(null); // Resetar feedback
      console.log("Submitting vehicle data:", vehicleData);
      const newVehicle = await createVehicle(vehicleData);
      console.log('Vehicle created successfully:', newVehicle);
      // setSuccess('Veículo cadastrado com sucesso!');
      alert('Veículo cadastrado com sucesso!'); // Mantendo alert por enquanto
      // setTimeout(() => history.push('/veiculos'), 1500);
      history.push('/veiculos');
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      const errMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
      // setError(`Falha ao cadastrar veículo: ${errMsg}`);
      alert(`Falha ao cadastrar veículo: ${errMsg}`); // Mantendo alert por enquanto
    }
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 'bold',
            color: 'primary.main'
          }}>
            Cadastrar Novo Veículo
          </Typography>
          <Box sx={{ mt: 3 }}>
            {/* Aqui podem entrar Alerts se o feedback for gerenciado aqui */}
            {/* error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> */}
            {/* success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> */}
            <VehicleForm onSubmit={handleFormSubmit} />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddVehiclePage;
