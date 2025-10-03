import React, { useState } from 'react';
import { Container, Paper, Box, Typography, Button, Grid, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
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
  LocalShipping as LocalShippingIcon,
  StickyNote2 as StickyNote2Icon
} from '@mui/icons-material';

const AdminDashboardPage = () => {
  const history = useHistory();
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteValue, setNoteValue] = useState(() => {
    try { return localStorage.getItem('sandboxStickyNote') || ''; } catch { return ''; }
  });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleOpenNote = () => setNoteOpen(true);
  const handleCloseNote = () => setNoteOpen(false);
  const handleSaveNote = () => {
    try { localStorage.setItem('sandboxStickyNote', noteValue || ''); } catch {}
    setSnack({ open: true, message: 'Nota atualizada com sucesso.', severity: 'success' });
    setNoteOpen(false);
  };
  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={2} columns={12}>
        {/* Esquerda: Card de botões (Acesso Rápido) */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, border: 'none', boxShadow: 'none' }}>
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
              <Button
                variant="contained"
                fullWidth
                startIcon={<StickyNote2Icon sx={{ fontSize: 28 }} />}
                onClick={handleOpenNote}
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
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left', flexGrow: 1, display: { xs: 'none', sm: 'inline' } }}>Gerenciar Nota/Aviso</Typography>
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
      {/* Dialogo para Gerenciar Nota/Aviso */}
      <Dialog open={noteOpen} onClose={handleCloseNote} fullWidth maxWidth="sm">
        <DialogTitle>Gerenciar Nota/Aviso</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder="Escreva aqui sua nota/aviso que será exibida na Home"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNote}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveNote}>Salvar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboardPage;
