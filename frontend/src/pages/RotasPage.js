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
  FormControlLabel,
  Divider,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { RouteStatus, routeStatusOptions } from '../constants/routeStatus';
import { cidadesPI } from '../services/cidadesPI';
import api from '../services/api';

const RotasPage = () => {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cidades, setCidades] = useState(cidadesPI);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingRota, setEditingRota] = useState(null);
  const [status, setStatus] = useState('');
  
  useEffect(() => {
    if (editingRota) {
      setStatus(editingRota.status || '');
    }
  }, [editingRota]);
  const [materiaisPorRota, setMateriaisPorRota] = useState({});
  const [loadingMateriais, setLoadingMateriais] = useState({});
  const [expandedRotas, setExpandedRotas] = useState({});
  const [editMaterialDialogOpen, setEditMaterialDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editedMaterial, setEditedMaterial] = useState(null);

  const getCidadeNome = (cidadeId) => {
    const cidade = cidades.find(c => String(c.id) === String(cidadeId));
    return cidade ? cidade.nome : 'Cidade não encontrada';
  };

  useEffect(() => {
    fetchRotas();
  }, []);

  const fetchRotas = async () => {
    try {
      const response = await api.get('/routes');
      setRotas(response.data);
      // Buscar materiais para cada rota
      response.data.forEach(rota => {
        fetchMateriais(rota.id);
      });
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar rotas');
      setLoading(false);
    }
  };

  const handleEditRota = async (rotaId) => {
    try {
      const rota = rotas.find(r => r.id === rotaId);
      setEditingRota({ ...rota });
      setStatus(rota.status || 'Agendada'); // Definindo um valor padrão
    } catch (err) {
      setError('Erro ao carregar rota para edição');
    }
  };

  const fetchMateriais = async (rotaId) => {
    try {
      setLoadingMateriais(prev => ({ ...prev, [rotaId]: true }));
      const response = await api.get(`/materials/rota/${rotaId}`);
      setMateriaisPorRota(prev => ({ ...prev, [rotaId]: response.data || [] }));
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      // Se o erro for 404 (não encontrado), não mostramos mensagem de erro
      if (error.response?.status !== 404) {
        setSnackbar({
          open: true,
          message: 'Erro ao buscar materiais: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'),
          severity: 'error'
        });
      }
      // Mesmo em caso de erro, setamos os materiais como vazio
      setMateriaisPorRota(prev => ({ ...prev, [rotaId]: [] }));
    } finally {
      setLoadingMateriais(prev => ({ ...prev, [rotaId]: false }));
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

  const handleSaveRota = async () => {
    if (!editingRota) return;

    try {
      const response = await api.put(`/routes/${editingRota.id}`, {
        identificacao: editingRota.identificacao,
        cidade_origem: editingRota.cidade_origem.id,
        cidade_destino: editingRota.cidade_destino.id,
        data_saida: editingRota.data_saida,
        data_retorno: editingRota.data_retorno,
        cidades_intermediarias_ida: editingRota.cidades_intermediarias_ida.map(c => c.id),
        cidades_intermediarias_volta: editingRota.cidades_intermediarias_volta.map(c => c.id),
        status: status
      });
      
      const updatedRotas = rotas.map(r => 
        r.id === editingRota.id ? response.data : r
      );
      setRotas(updatedRotas);
      setEditingRota(null);
      setStatus('');
      setSnackbar({
        open: true,
        message: 'Rota atualizada com sucesso',
        severity: 'success'
      });
    } catch (err) {
      setError('Erro ao atualizar rota');
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleToggleExpand = (rotaId) => {
    setExpandedRotas(prev => ({
      ...prev,
      [rotaId]: !prev[rotaId]
    }));
  };

  const handleEditMaterial = (material) => {
    setSelectedMaterial(material);
    setEditedMaterial({
      ...material,
      tipo: material.tipo,
      quantidade: material.quantidade,
      observacoes: material.observacoes || ''
    });
    setEditMaterialDialogOpen(true);
  };

  const handleDeleteMaterial = async (material) => {
    if (window.confirm('Tem certeza que deseja excluir este material?')) {
      try {
        await api.delete(`/materials/${material.id}`);
        await fetchMateriais(material.rota_id);
        setSnackbar({
          open: true,
          message: 'Material excluído com sucesso!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Erro ao deletar material:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao deletar material: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'),
          severity: 'error'
        });
      }
    }
  };

  const handleSaveMaterial = async () => {
    try {
      await api.put(`/materials/${editedMaterial.id}`, {
        tipo: editedMaterial.tipo,
        quantidade: editedMaterial.quantidade,
        observacoes: editedMaterial.observacoes
      });
      await fetchMateriais(editedMaterial.rota_id);
      setSnackbar({
        open: true,
        message: 'Material atualizado com sucesso!',
        severity: 'success'
      });
      setEditMaterialDialogOpen(false);
      setEditedMaterial(null);
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar material: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'),
        severity: 'error'
      });
    }
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
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography 
          variant="h5" 
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

      <Grid container spacing={2}>
        {rotas.map((rota) => {
          const materiais = materiaisPorRota[rota.id] || [];
          const isLoadingMateriais = loadingMateriais[rota.id];
          const isExpanded = expandedRotas[rota.id];
          
          return (
            <Grid item xs={12} key={rota.id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-1px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleToggleExpand(rota.id)}
                      size="small"
                      sx={{ 
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      Rota {rota.identificacao}
                    </Typography>
                  </Box>
                </Box>

                <Collapse in={isExpanded}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      {editingRota?.id === rota.id ? (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveRota}
                          size="small"
                        >
                          Salvar
                        </Button>
                      ) : (
                        <IconButton 
                          onClick={() => handleEditClick(rota)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Identificação"
                        value={editingRota?.id === rota.id ? editingRota.identificacao : rota.identificacao}
                        onChange={(e) => setEditingRota({...editingRota, identificacao: e.target.value})}
                        disabled={editingRota?.id !== rota.id}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={cidades}
                        getOptionLabel={(option) => option.nome}
                        value={editingRota?.id === rota.id ? editingRota.cidade_origem : cidades.find(c => String(c.id) === String(rota.cidade_origem))}
                        onChange={(_, newValue) => setEditingRota({...editingRota, cidade_origem: newValue})}
                        renderInput={(params) => <TextField {...params} label="Cidade de Origem" size="small" />}
                        disabled={editingRota?.id !== rota.id}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={cidades}
                        getOptionLabel={(option) => option.nome}
                        value={editingRota?.id === rota.id ? editingRota.cidade_destino : cidades.find(c => String(c.id) === String(rota.cidade_destino))}
                        onChange={(_, newValue) => setEditingRota({...editingRota, cidade_destino: newValue})}
                        renderInput={(params) => <TextField {...params} label="Cidade de Destino" size="small" />}
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
                        size="small"
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
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={editingRota?.status || rota?.status || ''}
                          onChange={(e) => setStatus(e.target.value)}
                          label="Status"
                          disabled={!editingRota}
                          displayEmpty
                          renderValue={(value) => value || 'Selecione um status'}
                        >
                          {routeStatusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Adicionando um Chip para mostrar o status quando não estiver em modo de edição */}
                    {!editingRota && rota?.status && (
                      <Grid item xs={12} sm={6}>
                        <Chip
                          label={rota.status}
                          color={rota.status === 'Agendada' ? 'primary' : 
                                rota.status === 'Andamento' ? 'warning' : 
                                rota.status === 'Concluida' ? 'success' : 
                                'error'}
                          size="small"
                          style={{ marginTop: 8 }}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={cidades}
                        getOptionLabel={(option) => option.nome}
                        value={editingRota?.id === rota.id ? editingRota.cidades_intermediarias_ida : (rota.cidades_intermediarias_ida || []).map(id => cidades.find(c => String(c.id) === String(id))).filter(Boolean)}
                        onChange={(_, newValue) => setEditingRota({...editingRota, cidades_intermediarias_ida: newValue})}
                        renderInput={(params) => <TextField {...params} label="Cidades Intermediárias - Ida" size="small" />}
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
                        renderInput={(params) => <TextField {...params} label="Cidades Intermediárias - Retorno" size="small" />}
                        disabled={editingRota?.id !== rota.id}
                      />
                    </Grid>

                    {/* Seção de Materiais */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      {isLoadingMateriais[rota.id] ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                          <CircularProgress size={20} />
                        </Box>
                      ) : !materiaisPorRota[rota.id] || materiaisPorRota[rota.id].length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                          Nenhum material cadastrado para esta rota.
                        </Typography>
                      ) : (
                        <TableContainer component={Paper} sx={{ mt: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Quantidade</TableCell>
                                <TableCell>Observações</TableCell>
                                <TableCell>Ações</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {materiaisPorRota[rota.id]?.map((material, index) => (
                                <TableRow key={index}>
                                  <TableCell>{material.tipo}</TableCell>
                                  <TableCell align="right">{material.quantidade}</TableCell>
                                  <TableCell>{material.observacoes || 'N/A'}</TableCell>
                                  <TableCell>
                                    <IconButton
                                      onClick={() => handleEditMaterial(material)}
                                      size="small"
                                      disabled={loadingMateriais[rota.id] || !material}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      onClick={() => handleDeleteMaterial(material)}
                                      size="small"
                                      disabled={loadingMateriais[rota.id] || !material}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Grid>
                  </Grid>
                </Collapse>
              </Paper>
            </Grid>
          );
        })}
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

      {/* Dialog para edição de material */}
      <Dialog open={editMaterialDialogOpen} onClose={() => setEditMaterialDialogOpen(false)}>
        <DialogTitle>Editar Material</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tipo"
              value={editedMaterial?.tipo || ''}
              onChange={(e) => setEditedMaterial({ ...editedMaterial, tipo: e.target.value })}
              fullWidth
            />
            <TextField
              label="Quantidade"
              type="number"
              value={editedMaterial?.quantidade || ''}
              onChange={(e) => setEditedMaterial({ ...editedMaterial, quantidade: e.target.value })}
              fullWidth
            />
            <TextField
              label="Observações"
              value={editedMaterial?.observacoes || ''}
              onChange={(e) => setEditedMaterial({ ...editedMaterial, observacoes: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMaterialDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveMaterial} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RotasPage; 