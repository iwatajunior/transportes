import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import VehicleForm from '../components/vehicles/VehicleForm';
import { getVehicleById, updateVehicle } from '../services/api';
import { Container, Paper, Typography, Box, Alert } from '@mui/material';

const EditVehiclePage = () => {
  const { id } = useParams();
  const history = useHistory();
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const fetchVehicle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVehicleById(id);
      const formattedData = {
        placa: data.placa || '',
        marca: data.marca || '',
        modelo: data.modelo || '',
        ano: data.ano || '',
        tipo: data.tipo || 'Carro',
        tipo_uso: data.tipo_uso || '',
        capacidade: data.capacidade || '',
        quilometragematual: data.quilometragematual || '',
        observacoes: data.observacoes || '',
        status: data.status || 'Disponivel'
      };
      setVehicleData(formattedData);
    } catch (err) {
      setError(err.message || 'Falha ao buscar dados do veículo.');
      setVehicleData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const handleUpdateVehicle = async (formData) => {
    setSubmitError(null);
    try {
      const dataToSubmit = {
        ...formData,
        ano: parseInt(formData.ano, 10),
        capacidade: parseInt(formData.capacidade, 10),
        quilometragematual: parseInt(formData.quilometragematual, 10),
        tipo_uso: formData.tipo_uso || null,
        observacoes: formData.observacoes || null,
        placa: formData.placa.toUpperCase().replace(/-/g, '')
      };

      await updateVehicle(id, dataToSubmit);
      history.push('/veiculos');
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Falha ao atualizar veículo.');
      if (err.response && err.response.data) {
        console.error("Erro ao atualizar - Resposta Completa do Backend:", JSON.stringify(err.response.data, null, 2));
        if (err.response.data.details && Array.isArray(err.response.data.details)) {
          console.error("Detalhes da Validação do Backend:", err.response.data.details.join('; '));
        }
      } else {
        console.error("Erro ao atualizar (sem resposta detalhada do backend):", err);
      }
    }
  };

  if (loading) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Typography variant="h6">Carregando dados do veículo...</Typography>
    </Container>
  );
  if (error) return (
    <Container>
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
    </Container>
  );
  if (!vehicleData) return (
    <Container>
      <Alert severity="error" sx={{ mb: 2 }}>Veículo não encontrado.</Alert>
    </Container>
  );

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 'bold',
            color: 'primary.main'
          }}>
            Editar Veículo
          </Typography>
          <Box sx={{ mt: 2, mb: 2 }}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
            )}
          </Box>
          <VehicleForm onSubmit={handleUpdateVehicle} initialData={vehicleData} />
        </Box>
      </Paper>
    </Container>
  );
};

export default EditVehiclePage;
