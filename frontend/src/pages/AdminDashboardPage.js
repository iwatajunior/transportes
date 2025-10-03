import React from 'react';
import { Container, Paper, Box, Typography, Button, Grid, Divider } from '@mui/material';
import { useHistory } from 'react-router-dom';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import {
  List as ListIcon,
  Explore as ExploreIcon,
  Luggage as LuggageIcon,
  Reviews as ReviewsIcon,
  DirectionsCar as DirectionsCarIcon,
  ManageSearch as ManageSearchIcon,
  ForkRight as ForkRightIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';

const AdminDashboardPage = () => {
  const history = useHistory();
  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={2} columns={12}>
        {/* Esquerda: Card de botões (Acesso Rápido) */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Divider textAlign="left" sx={{ width:'100%', mb: 1, '&::before, &::after': { borderColor: 'divider' } }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.6 }}>Operações</Typography>
              </Divider>
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
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Painel de Viagens</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ThumbUpAltIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/avaliacoes')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Pesquisa de Satisfação</Typography>
              </Button>
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
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Veículos</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ManageSearchIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/gerenciarviagens')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Gerenciar Viagens</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ForkRightIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/rotas')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Gerenciar Rotas</Typography>
              </Button>
              <Divider textAlign="left" sx={{ width:'100%', mt: 0.5, mb: 0.5, '&::before, &::after': { borderColor: 'divider' } }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.6 }}>Meus Itens</Typography>
              </Divider>
              <Button
                variant="contained"
                fullWidth
                startIcon={<LuggageIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/minhasviagens')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Minhas Viagens</Typography>
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<LocalShippingIcon sx={{ fontSize: 28 }} />}
                onClick={() => history.push('/envios')}
                sx={{
                  bgcolor: '#FF9800',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 1,
                  py: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  '&:hover': { transform: 'scale(1.02)', bgcolor: '#F57C00' }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Meus Envios</Typography>
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Centro: Placeholder */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, minHeight: 200 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Notas</Typography>
            <Typography variant="body2" color="text.secondary">Conteúdo a ser definido.</Typography>
          </Paper>
        </Grid>

        {/* Direita: Placeholder */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, minHeight: 200 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Métricas</Typography>
            <Typography variant="body2" color="text.secondary">Conteúdo a ser definido.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboardPage;
