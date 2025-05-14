import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bem-vindo ao Sistema de Transportes
      </Typography>
      <Typography variant="body1" paragraph>
        Esta é a página inicial. Selecione uma das opções abaixo para continuar.
      </Typography>
      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/admin/users"
          sx={{ marginRight: 2 }}
        >
          Gerenciar Usuários
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/registrar-viagem"
        >
          Requisitar Nova Viagem
        </Button>
        {/* Adicione outros links para funcionalidades principais aqui */}
      </Box>
    </Container>
  );
};

export default HomePage;
