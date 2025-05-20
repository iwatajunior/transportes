import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, IconButton, TextField, Autocomplete } from '@mui/material';
import { DirectionsBus, LocationOn, ArrowForward, LocalShipping as LocalShippingIcon, Edit, CalendarToday } from '@mui/icons-material';
import api from '../services/api';
import { cidadesPI } from '../services/cidadesPI';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RouteMap = () => {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRota, setSelectedRota] = useState(null);
  const [selectedCidade, setSelectedCidade] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedRota, setEditedRota] = useState(null);
  const [cidades, setCidades] = useState(cidadesPI);

  const fetchRotas = async () => {
    try {
      const response = await api.get('/routes?home=true');
      setRotas(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar rotas');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRotas();
  }, []);

  const getCidadeNome = (id) => {
    const cidade = cidadesPI.find(c => String(c.id) === String(id));
    return cidade ? cidade.nome : id;
  };

  const handleInteresseClick = (rota) => {
    setSelectedRota(rota);
    setSelectedCidade('');
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedRota(null);
    setSelectedCidade('');
  };

  const handleConfirmarInteresse = () => {
    // Aqui você pode fazer uma chamada à API para registrar o interesse do usuário
    setSnackbar({ open: true, message: 'Interesse registrado com sucesso!', severity: 'success' });
    setOpenDialog(false);
    setSelectedRota(null);
    setSelectedCidade('');
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditClick = (rota) => {
    setSelectedRota(rota);
    setEditedRota({
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
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await api.put(`/routes/${selectedRota.id}`, {
        identificacao: editedRota.identificacao,
        cidade_origem: editedRota.cidade_origem.id,
        cidade_destino: editedRota.cidade_destino.id,
        data_saida: editedRota.data_saida,
        data_retorno: editedRota.data_retorno,
        cidades_intermediarias_ida: editedRota.cidades_intermediarias_ida.map(c => c.id),
        cidades_intermediarias_volta: editedRota.cidades_intermediarias_volta.map(c => c.id)
      });

      if (response.status !== 200) {
        throw new Error('Erro ao atualizar rota');
      }

      await fetchRotas();
      setEditDialogOpen(false);
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

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando rotas...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (rotas.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalShippingIcon sx={{ color: '#1976d2', fontSize: 32 }} />
          Rotas programadas
        </Typography>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: '#f8f9fa',
            textAlign: 'center'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Não há rotas ativas no momento.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalShippingIcon sx={{ color: '#1976d2', fontSize: 32 }} />
        Rotas programadas
      </Typography>
      <Grid container spacing={3}>
        {rotas.map((rota) => {
          // Montar lista de cidades da rota
          const cidadesRota = [
            { id: rota.cidade_origem, nome: getCidadeNome(rota.cidade_origem) },
            ...((rota.cidades_intermediarias_ida || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) }))),
            { id: rota.cidade_destino, nome: getCidadeNome(rota.cidade_destino) },
            ...((rota.cidades_intermediarias_volta || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) })))
          ];
          // Remover duplicatas
          const cidadesUnicas = cidadesRota.filter((c, idx, arr) => arr.findIndex(x => x.id === c.id) === idx);
          return (
            <Grid item xs={12} key={rota.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
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
                    {rota.identificacao}
                  </Typography>
                </Box>
                <Grid container spacing={2} alignItems="center">
                  {/* Origem */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="primary" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Origem
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {getCidadeNome(rota.cidade_origem)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {/* Seta */}
                  <Grid item xs={12} sm={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ArrowForward sx={{ color: '#666' }} />
                  </Grid>
                  {/* Destino */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="secondary" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Destino
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {getCidadeNome(rota.cidade_destino)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {/* Datas */}
                  <Grid item xs={12} sm={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Período
                      </Typography>
                      <Typography variant="body2">
                        Saída: {new Date(rota.data_saida).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        Retorno: {new Date(rota.data_retorno).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                {/* Cidades Intermediárias */}
                {(rota.cidades_intermediarias_ida?.length > 0 || rota.cidades_intermediarias_volta?.length > 0) && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mt: 2 }}>
                      {rota.cidades_intermediarias_ida?.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Percurso de Ida
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {rota.cidades_intermediarias_ida.map((cidadeId, index) => (
                              <Chip
                                key={`ida-${index}`}
                                label={getCidadeNome(cidadeId)}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {rota.cidades_intermediarias_volta?.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" color="secondary" gutterBottom>
                            Percurso de Retorno
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {rota.cidades_intermediarias_volta.map((cidadeId, index) => (
                              <Chip
                                key={`volta-${index}`}
                                label={getCidadeNome(cidadeId)}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      {/* Dialog para interesse */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Tenho interesse em enviar material</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Selecione a cidade</InputLabel>
            <Select
              value={selectedCidade}
              onChange={e => setSelectedCidade(e.target.value)}
              label="Selecione a cidade"
            >
              {selectedRota && (() => {
                // Montar lista de cidades da rota
                const cidadesRota = [
                  { id: selectedRota.cidade_origem, nome: getCidadeNome(selectedRota.cidade_origem) },
                  ...((selectedRota.cidades_intermediarias_ida || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) }))),
                  { id: selectedRota.cidade_destino, nome: getCidadeNome(selectedRota.cidade_destino) },
                  ...((selectedRota.cidades_intermediarias_volta || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) })))
                ];
                // Remover duplicatas
                const cidadesUnicas = cidadesRota.filter((c, idx, arr) => arr.findIndex(x => x.id === c.id) === idx);
                return cidadesUnicas.map(cidade => (
                  <MenuItem key={cidade.id} value={cidade.id}>{cidade.nome}</MenuItem>
                ));
              })()}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button onClick={handleConfirmarInteresse} disabled={!selectedCidade} variant="contained">Confirmar Interesse</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Rota</DialogTitle>
        <DialogContent>
          {editedRota && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Identificação"
                    value={editedRota.identificacao || ''}
                    onChange={(e) => setEditedRota({...editedRota, identificacao: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={cidades}
                    getOptionLabel={(option) => option.nome}
                    value={editedRota.cidade_origem}
                    onChange={(_, newValue) => setEditedRota({...editedRota, cidade_origem: newValue})}
                    renderInput={(params) => <TextField {...params} label="Cidade de Origem" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={cidades}
                    getOptionLabel={(option) => option.nome}
                    value={editedRota.cidade_destino}
                    onChange={(_, newValue) => setEditedRota({...editedRota, cidade_destino: newValue})}
                    renderInput={(params) => <TextField {...params} label="Cidade de Destino" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data de Saída"
                    value={editedRota.data_saida ? editedRota.data_saida.split('T')[0] : ''}
                    onChange={(e) => setEditedRota({...editedRota, data_saida: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data de Retorno"
                    value={editedRota.data_retorno ? editedRota.data_retorno.split('T')[0] : ''}
                    onChange={(e) => setEditedRota({...editedRota, data_retorno: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={cidades}
                    getOptionLabel={(option) => option.nome}
                    value={editedRota.cidades_intermediarias_ida}
                    onChange={(_, newValue) => setEditedRota({...editedRota, cidades_intermediarias_ida: newValue})}
                    renderInput={(params) => <TextField {...params} label="Cidades Intermediárias - Ida" />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={cidades}
                    getOptionLabel={(option) => option.nome}
                    value={editedRota.cidades_intermediarias_volta}
                    onChange={(_, newValue) => setEditedRota({...editedRota, cidades_intermediarias_volta: newValue})}
                    renderInput={(params) => <TextField {...params} label="Cidades Intermediárias - Retorno" />}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RouteMap; 