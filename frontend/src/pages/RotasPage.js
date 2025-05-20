import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  Autocomplete,
  Button,
  Paper,
  Snackbar,
  Alert,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';
import { cidadesPI } from '../services/cidadesPI';
import api from '../services/api';

const RotasPage = () => {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cidades, setCidades] = useState(cidadesPI);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingRota, setEditingRota] = useState(null);

  useEffect(() => {
    fetchRotas();
  }, []);

  const fetchRotas = async () => {
    try {
      const response = await api.get('/routes');
      setRotas(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar rotas');
      setLoading(false);
    }
  };

  const handleEditClick = (rota) => {
    setEditingRota({
      ...rota,
      cidade_origem: cidades.find(c => String(c.id) === String(rota.cidade_origem)) || null,
      cidade_destino: cidades.find(c => String(c.id) === String(rota.cidade_destino)) || null,
      cidades_intermediarias_ida: (rota.cidades_intermediarias_ida || []).map(id => 
        cidades.find(c => String(c.id) === String(id))
      ).filter(Boolean),
      cidades_intermediarias_volta: (rota.cidades_intermediarias_volta || []).map(id => 
        cidades.find(c => String(c.id) === String(id))
      ).filter(Boolean)
    });
  };

  const handleSave = async (rota) => {
    try {
      const response = await api.put(`/routes/${rota.id}`, {
        identificacao: rota.identificacao,
        cidade_origem: rota.cidade_origem.id,
        cidade_destino: rota.cidade_destino.id,
        data_saida: rota.data_saida,
        data_retorno: rota.data_retorno,
        cidades_intermediarias_ida: rota.cidades_intermediarias_ida.map(c => c.id),
        cidades_intermediarias_volta: rota.cidades_intermediarias_volta.map(c => c.id),
        status: rota.status
      });

      if (response.status !== 200) {
        throw new Error('Erro ao atualizar rota');
      }

      await fetchRotas();
      setEditingRota(null);
      setSnackbar({
        open: true,
        message: 'Rota atualizada com sucesso!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao atualizar rota:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar rota: ' + (err.message || 'Erro desconhecido'),
        severity: 'error'
      });
    }
  };

  const handleStatusChange = async (rota) => {
    try {
      const newStatus = rota.status === 'ativo' ? 'inativo' : 'ativo';
      const response = await api.put(`/routes/${rota.id}`, {
        identificacao: rota.identificacao,
        cidade_origem: rota.cidade_origem,
        cidade_destino: rota.cidade_destino,
        data_saida: rota.data_saida,
        data_retorno: rota.data_retorno,
        cidades_intermediarias_ida: rota.cidades_intermediarias_ida || [],
        cidades_intermediarias_volta: rota.cidades_intermediarias_volta || [],
        status: newStatus
      });

      if (response.status !== 200) {
        throw new Error('Erro ao atualizar status da rota');
      }

      await fetchRotas();
      setSnackbar({
        open: true,
        message: `Rota ${newStatus === 'ativo' ? 'ativada' : 'inativada'} com sucesso!`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao atualizar status da rota:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar status da rota: ' + (err.message || 'Erro desconhecido'),
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Carregando rotas...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          Rotas Cadastradas
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {rotas.map((rota) => (
          <Grid item xs={12} key={rota.id}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                backgroundColor: '#f8f9fa',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Rota {rota.identificacao}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rota.status === 'ativo'}
                        onChange={() => handleStatusChange(rota)}
                        color="primary"
                      />
                    }
                    label={rota.status === 'ativo' ? 'Ativa' : 'Inativa'}
                  />
                  {editingRota?.id === rota.id ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSave(editingRota)}
                    >
                      Salvar
                    </Button>
                  ) : (
                    <IconButton 
                      onClick={() => handleEditClick(rota)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Identificação"
                    value={editingRota?.id === rota.id ? editingRota.identificacao : rota.identificacao}
                    onChange={(e) => setEditingRota({...editingRota, identificacao: e.target.value})}
                    disabled={editingRota?.id !== rota.id}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={cidades}
                    getOptionLabel={(option) => option.nome}
                    value={editingRota?.id === rota.id ? editingRota.cidade_origem : cidades.find(c => String(c.id) === String(rota.cidade_origem))}
                    onChange={(_, newValue) => setEditingRota({...editingRota, cidade_origem: newValue})}
                    renderInput={(params) => <TextField {...params} label="Cidade de Origem" />}
                    disabled={editingRota?.id !== rota.id}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={cidades}
                    getOptionLabel={(option) => option.nome}
                    value={editingRota?.id === rota.id ? editingRota.cidade_destino : cidades.find(c => String(c.id) === String(rota.cidade_destino))}
                    onChange={(_, newValue) => setEditingRota({...editingRota, cidade_destino: newValue})}
                    renderInput={(params) => <TextField {...params} label="Cidade de Destino" />}
                    disabled={editingRota?.id !== rota.id}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data de Saída"
                    value={editingRota?.id === rota.id ? editingRota.data_saida.split('T')[0] : rota.data_saida.split('T')[0]}
                    onChange={(e) => setEditingRota({...editingRota, data_saida: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    disabled={editingRota?.id !== rota.id}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data de Retorno"
                    value={editingRota?.id === rota.id ? editingRota.data_retorno.split('T')[0] : rota.data_retorno.split('T')[0]}
                    onChange={(e) => setEditingRota({...editingRota, data_retorno: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    disabled={editingRota?.id !== rota.id}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={cidades}
                    getOptionLabel={(option) => option.nome}
                    value={editingRota?.id === rota.id ? editingRota.cidades_intermediarias_ida : (rota.cidades_intermediarias_ida || []).map(id => cidades.find(c => String(c.id) === String(id))).filter(Boolean)}
                    onChange={(_, newValue) => setEditingRota({...editingRota, cidades_intermediarias_ida: newValue})}
                    renderInput={(params) => <TextField {...params} label="Cidades Intermediárias - Ida" />}
                    disabled={editingRota?.id !== rota.id}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={cidades}
                    getOptionLabel={(option) => option.nome}
                    value={editingRota?.id === rota.id ? editingRota.cidades_intermediarias_volta : (rota.cidades_intermediarias_volta || []).map(id => cidades.find(c => String(c.id) === String(id))).filter(Boolean)}
                    onChange={(_, newValue) => setEditingRota({...editingRota, cidades_intermediarias_volta: newValue})}
                    renderInput={(params) => <TextField {...params} label="Cidades Intermediárias - Retorno" />}
                    disabled={editingRota?.id !== rota.id}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RotasPage; 