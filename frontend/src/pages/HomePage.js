import React from 'react';
import { Container, Typography, Box, Button, Grid, Link as RouterLink } from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Dashboard as DashboardIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  DirectionsBus as BusIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RouteMap from '../components/RouteMap';

const BUTTON_COLOR = '#FFA500';

const HomePage = () => {
  const { user } = useAuth();
  const history = useHistory();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontFamily: "'Exo 2', sans-serif", 
            fontWeight: 'bold',
            color: '#1976d2'
          }}
        >
          {user?.nome ? `Bem-vindo, ${user.nome}!` : 'Bem-vindo ao Rotas e Viagens!'}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: "'Exo 2', sans-serif",
            color: 'text.secondary'
          }}
        >
          Requisite e Gerencie Suas Viagens Aqui!
        </Typography>
      </Box>

      {/* Main Actions Grid */}
      <Grid container spacing={2}>
        {/* Primary Actions */}
        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<LocalShippingIcon sx={{ fontSize: 28 }} />}
            onClick={() => history.push('/cadastrar-rota')}
            sx={{
              bgcolor: '#FF9800',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: '#F57C00'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Nova Rota</Typography>
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<EditIcon sx={{ fontSize: 28 }} />}
            onClick={() => history.push('/rotas')}
            sx={{
              bgcolor: '#FF9800',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: '#F57C00'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Editar Rotas</Typography>
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<AddIcon sx={{ fontSize: 28 }} />}
            onClick={() => history.push('/registrar-viagem')}
            sx={{
              bgcolor: '#FF9800',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: '#F57C00'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Nova Viagem</Typography>
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<ListIcon sx={{ fontSize: 28 }} />}
            onClick={() => history.push('/viagens')}
            sx={{
              bgcolor: '#FF9800',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: '#F57C00'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Painel de Viagens</Typography>
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<DashboardIcon sx={{ fontSize: 28 }} />}
            onClick={() => history.push('/admin/dashboard')}
            sx={{
              bgcolor: '#FF9800',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: '#F57C00'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Dashboard</Typography>
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<DirectionsCarIcon sx={{ fontSize: 28 }} />}
            onClick={() => history.push('/veiculos')}
            sx={{
              bgcolor: '#FF9800',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: '#F57C00'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Veículos</Typography>
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<PersonIcon sx={{ fontSize: 28 }} />}
            onClick={() => history.push('/usuarios')}
            sx={{
              bgcolor: '#FF9800',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: '#F57C00'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Usuários</Typography>
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<LocalShippingIcon sx={{ fontSize: 28 }} />}
            onClick={() => {
              // Aqui você pode abrir um modal ou redirecionar para uma página onde o usuário escolhe a rota e a cidade
              alert('Funcionalidade em desenvolvimento: Escolha uma rota e cidade para enviar materiais.');
            }}
            sx={{
              bgcolor: '#FF9800',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                transform: 'scale(1.02)',
                bgcolor: '#F57C00'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Enviar material</Typography>
          </Button>
        </Grid>
      </Grid>

      <RouteMap />
    </Container>
  );
};

export default HomePage;
