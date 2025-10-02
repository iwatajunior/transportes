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
  TablePagination,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  ForkRight as ForkRightIcon,
  FilterAltOff as FilterAltOffIcon
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [filters, setFilters] = useState({ origem: '', destino: '', dataSaida: '', dataRetorno: '', material: '' });
  
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

  // Util helpers similar to TripListPage
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      .toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'Pendente':
        return { color: 'default' };
      case 'Agendada':
        return { color: 'warning' };
      case 'Andamento':
        return { color: 'primary' };
      case 'Concluida':
        return { color: 'success' };
      case 'Cancelada':
        return { color: 'error' };
      default:
        return { color: 'default' };
    }
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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ origem: '', destino: '', dataSaida: '', dataRetorno: '', material: '' });
    setPage(0);
  };

  const handleToggleExpand = (rotaId) => {
    setExpandedRotas(prev => {
      const isCurrentlyOpen = Boolean(prev[rotaId]);
      // Collapse all; then open only the clicked one if it was closed
      const next = {};
      if (!isCurrentlyOpen) {
        next[rotaId] = true;
      }
      return next;
    });
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
    <Container maxWidth="xl" sx={{ mt: 1, mb: 1 }}>
      <Paper elevation={3} sx={{ p: 1.5, backgroundColor: '#FFFFFF', borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
            <ForkRightIcon sx={{ fontSize: '2rem' }} />
            Painel de Rotas
          </Typography>
        </Box>

        {/* Filtros */}
        <Paper elevation={0} sx={{ p: 1, mb: 1.5, border: (theme) => `1px solid ${theme.palette.grey[200]}`, borderRadius: 1 }}>
          <Grid container spacing={1} columns={12}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Origem"
                value={filters.origem}
                onChange={(e) => handleFilterChange('origem', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Destino"
                value={filters.destino}
                onChange={(e) => handleFilterChange('destino', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Data Saída"
                value={filters.dataSaida}
                onChange={(e) => handleFilterChange('dataSaida', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data Retorno"
                  value={filters.dataRetorno}
                  onChange={(e) => handleFilterChange('dataRetorno', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <Tooltip title="Limpar filtros">
                  <IconButton size="small" onClick={clearFilters} aria-label="Limpar filtros">
                    <FilterAltOffIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Material (tipo/obs/qtde)"
                value={filters.material}
                onChange={(e) => handleFilterChange('material', e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        <TableContainer>
          <Table 
            size="small" 
            sx={{ 
              minWidth: 800,
              backgroundColor: '#fff',
              '& .MuiTableCell-root': {
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                padding: '8px 16px'
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', width: 48 }} />
                <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 140 }}>Rota:</TableCell>
                <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 110 }}>Status</TableCell>
                <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Origem</TableCell>
                <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Destino</TableCell>
                <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 120 }}>Data Saída</TableCell>
                <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 120 }}>Data Retorno</TableCell>
                <TableCell align="right" sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 90 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...rotas]
                .filter((r) => {
                  const nomeOrigem = getCidadeNome(r.cidade_origem).toLowerCase();
                  const nomeDestino = getCidadeNome(r.cidade_destino).toLowerCase();
                  const fOri = filters.origem.trim().toLowerCase();
                  const fDes = filters.destino.trim().toLowerCase();
                  const fSaida = filters.dataSaida.trim();
                  const fRet = filters.dataRetorno.trim();
                  const fMat = filters.material.trim().toLowerCase();
                  const dataOut = r?.data_saida ? String(r.data_saida).slice(0,10) : '';
                  const dataRet = r?.data_retorno ? String(r.data_retorno).slice(0,10) : '';
                  const matchOrigem = !fOri || nomeOrigem.includes(fOri);
                  const matchDestino = !fDes || nomeDestino.includes(fDes);
                  const matchSaida = !fSaida || dataOut === fSaida;
                  const matchRet = !fRet || dataRet === fRet;
                  // Filtro por material: verifica materiais carregados desta rota
                  const mats = materiaisPorRota[r.id] || [];
                  const matchMaterial = !fMat || mats.some(m => {
                    const tipo = (m?.tipo || '').toString().toLowerCase();
                    const obs = (m?.observacoes || '').toString().toLowerCase();
                    const qt = (m?.quantidade != null ? String(m.quantidade) : '').toLowerCase();
                    return tipo.includes(fMat) || obs.includes(fMat) || qt.includes(fMat);
                  });
                  return matchOrigem && matchDestino && matchSaida && matchRet && matchMaterial;
                })
                .sort((a, b) => {
                  const rank = { Agendada: 0, Andamento: 1, Concluida: 2, Cancelada: 3 };
                  const ra = rank[a?.status] ?? 99;
                  const rb = rank[b?.status] ?? 99;
                  if (ra !== rb) return ra - rb;
                  // tie-breaker by data_saida ascending
                  const da = a?.data_saida ? new Date(a.data_saida).getTime() : 0;
                  const db = b?.data_saida ? new Date(b.data_saida).getTime() : 0;
                  return da - db;
                })
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((rota) => (
                  <React.Fragment key={rota.id}>
                    <TableRow>
                      <TableCell sx={{ py: 0, px: 1, width: 48 }}>
                        <IconButton size="small" onClick={() => handleToggleExpand(rota.id)}>
                          {expandedRotas[rota.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 2, whiteSpace: 'nowrap', maxWidth: 200 }}>
                        {rota.identificacao ? (
                          <Typography variant="body2" title={`ID #${rota.id}`}>{rota.identificacao}</Typography>
                        ) : (
                          <>#{rota.id}</>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 2, width: 110 }}>
                        <Chip label={rota.status || 'N/A'} color={getStatusColor(rota.status).color} size="small" />
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 2, maxWidth: 160, whiteSpace: 'nowrap' }}>{getCidadeNome(rota.cidade_origem)}</TableCell>
                      <TableCell sx={{ py: 1, px: 2, maxWidth: 160, whiteSpace: 'nowrap' }}>{getCidadeNome(rota.cidade_destino)}</TableCell>
                      <TableCell sx={{ py: 1, px: 2, maxWidth: 120, whiteSpace: 'nowrap' }}>{formatDate(rota.data_saida)}</TableCell>
                      <TableCell sx={{ py: 1, px: 2, maxWidth: 120, whiteSpace: 'nowrap' }}>{formatDate(rota.data_retorno)}</TableCell>
                      <TableCell align="right" sx={{ py: 1, px: 2, width: 90 }}>
                        <IconButton color="primary" size="small" onClick={() => handleEditClick(rota)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 0, px: 0 }}>
                        <Collapse in={Boolean(expandedRotas[rota.id])} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, backgroundColor: (theme) => theme.palette.action.hover }}>
                            {loadingMateriais[rota.id] ? (
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
                                      <TableCell align="right">Quantidade</TableCell>
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
                                          <IconButton onClick={() => handleEditMaterial(material)} size="small" disabled={loadingMateriais[rota.id] || !material}>
                                            <EditIcon />
                                          </IconButton>
                                          <IconButton onClick={() => handleDeleteMaterial(material)} size="small" disabled={loadingMateriais[rota.id] || !material}>
                                            <DeleteIcon />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={rotas.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          rowsPerPageOptions={[6, 12, 24, 48]}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </Paper>

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

      {/* Dialog: Editar Rota */}
      <Dialog open={Boolean(editingRota)} onClose={() => setEditingRota(null)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Rota</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Identificação"
              value={editingRota?.identificacao || ''}
              onChange={(e) => setEditingRota(prev => ({ ...prev, identificacao: e.target.value }))}
              size="small"
            />
            <Autocomplete
              options={cidades}
              getOptionLabel={(option) => option.nome}
              value={editingRota?.cidade_origem || null}
              onChange={(_, newValue) => setEditingRota(prev => ({ ...prev, cidade_origem: newValue }))}
              renderInput={(params) => <TextField {...params} label="Cidade de Origem" size="small" />}
            />
            <Autocomplete
              options={cidades}
              getOptionLabel={(option) => option.nome}
              value={editingRota?.cidade_destino || null}
              onChange={(_, newValue) => setEditingRota(prev => ({ ...prev, cidade_destino: newValue }))}
              renderInput={(params) => <TextField {...params} label="Cidade de Destino" size="small" />}
            />
            <Autocomplete
              multiple
              options={cidades}
              getOptionLabel={(option) => option.nome}
              value={editingRota?.cidades_intermediarias_ida || []}
              onChange={(_, newValue) => setEditingRota(prev => ({ ...prev, cidades_intermediarias_ida: newValue }))}
              renderInput={(params) => <TextField {...params} label="Cidades Intermediárias - Ida" size="small" />}
            />
            <Autocomplete
              multiple
              options={cidades}
              getOptionLabel={(option) => option.nome}
              value={editingRota?.cidades_intermediarias_volta || []}
              onChange={(_, newValue) => setEditingRota(prev => ({ ...prev, cidades_intermediarias_volta: newValue }))}
              renderInput={(params) => <TextField {...params} label="Cidades Intermediárias - Retorno" size="small" />}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Saída"
                  value={editingRota?.data_saida ? editingRota.data_saida.split('T')[0] : ''}
                  onChange={(e) => setEditingRota(prev => ({ ...prev, data_saida: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Retorno"
                  value={editingRota?.data_retorno ? editingRota.data_retorno.split('T')[0] : ''}
                  onChange={(e) => setEditingRota(prev => ({ ...prev, data_retorno: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingRota?.status || ''}
                label="Status"
                onChange={(e) => setEditingRota(prev => ({ ...prev, status: e.target.value }))}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingRota(null)}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveRota}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para edição de material (permanece inalterado) */}
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