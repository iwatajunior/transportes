import React from 'react';
import { Container, Typography, Box, Button, Grid, Link as RouterLink } from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Dashboard as DashboardIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import RotaVeiculo from '../components/RotaVeiculo';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

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
          <Link to="/cadastrar-rota" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              color="primary"
              fullWidth
              startIcon={<LocalShippingIcon sx={{ fontSize: 28 }} />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Nova Rota</Typography>
            </Button>
          </Link>
        </Grid>

        <Grid item xs={12} md={4}>
          <Link to="/registrar-viagem" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              color="primary"
              fullWidth
              startIcon={<AddIcon sx={{ fontSize: 28 }} />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Nova Viagem</Typography>
            </Button>
          </Link>
        </Grid>

        <Grid item xs={12} md={4}>
          <Link to="/viagens" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              color="secondary"
              fullWidth
              startIcon={<ListIcon sx={{ fontSize: 28 }} />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Painel de Viagens</Typography>
            </Button>
          </Link>
        </Grid>

        <Grid item xs={12} md={4}>
          <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              color="info"
              fullWidth
              startIcon={<DashboardIcon sx={{ fontSize: 28 }} />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Dashboard</Typography>
            </Button>
          </Link>
        </Grid>

        <Grid item xs={12} md={4}>
          <Link to="/veiculos" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              color="warning"
              fullWidth
              startIcon={<DirectionsCarIcon sx={{ fontSize: 28 }} />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Veículos</Typography>
            </Button>
          </Link>
        </Grid>

        <Grid item xs={12} md={4}>
          <Link to="/usuarios" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              color="error"
              fullWidth
              startIcon={<PersonIcon sx={{ fontSize: 28 }} />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Usuários</Typography>
            </Button>
          </Link>
        </Grid>
      </Grid>

      {/* RotaVeiculo Component */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 2,
        p: 3,
        mt: 4
      }}>
        <RotaVeiculo />
      </Box>
    </Container>
  );
};

export default HomePage;
