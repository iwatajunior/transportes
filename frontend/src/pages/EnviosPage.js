import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Paper,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterAltOff as FilterAltOffIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import api from '../services/api';
import { cidadesPI } from '../services/cidadesPI';
import { useAuth } from '../contexts/AuthContext';

const EnviosPage = () => {
  const { user } = useAuth();
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [filters, setFilters] = useState({ destino: '', material: '', status: '' });

  const [materiaisPorRota, setMateriaisPorRota] = useState({});
  const [loadingMateriais, setLoadingMateriais] = useState({});
  // Removido Collapse/expand: tabela de materiais sempre visível abaixo de cada rota

  const cidades = cidadesPI;

  const getCidadeNome = (cidadeId) => {
    const cidade = cidades.find(c => String(c.id) === String(cidadeId));
    return cidade ? cidade.nome : 'Cidade não encontrada';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      .toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'Pendente': return { color: 'default' };
      case 'Agendada': return { color: 'warning' };
      case 'Andamento': return { color: 'primary' };
      case 'Concluida': return { color: 'success' };
      case 'Cancelada': return { color: 'error' };
      default: return { color: 'default' };
    }
  };

  useEffect(() => {
    fetchRotas();
  }, []);

  const fetchRotas = async () => {
    try {
      const response = await api.get('/routes');
      setRotas(response.data || []);
      (response.data || []).forEach((rota) => fetchMateriais(rota.id));
    } catch (err) {
      setError('Erro ao carregar rotas');
    } finally {
      setLoading(false);
    }
  };

  const fetchMateriais = async (rotaId) => {
    try {
      setLoadingMateriais(prev => ({ ...prev, [rotaId]: true }));
      const response = await api.get(`/materials/rota/${rotaId}`);
      setMateriaisPorRota(prev => ({ ...prev, [rotaId]: response.data || [] }));
    } catch (error) {
      if (error.response?.status !== 404) {
        setSnackbar({ open: true, message: 'Erro ao buscar materiais: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'), severity: 'error' });
      }
      setMateriaisPorRota(prev => ({ ...prev, [rotaId]: [] }));
    } finally {
      setLoadingMateriais(prev => ({ ...prev, [rotaId]: false }));
    }
  };

  const handleDeleteMaterial = async (material) => {
    if (!window.confirm('Tem certeza que deseja excluir este material?')) return;
    try {
      await api.delete(`/materials/${material.id}`);
      await fetchMateriais(material.rota_id);
      setSnackbar({ open: true, message: 'Material excluído com sucesso!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao deletar material: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'), severity: 'error' });
    }
  };

  const handleEditMaterial = async (material) => {
    setEditedMaterial(material);
    setEditMaterialDialogOpen(true);
  };

  const [editMaterialDialogOpen, setEditMaterialDialogOpen] = useState(false);
  const [editedMaterial, setEditedMaterial] = useState(null);
  const handleSaveMaterial = async () => {
    try {
      await api.put(`/materials/${editedMaterial.id}`, {
        tipo: editedMaterial.tipo,
        quantidade: editedMaterial.quantidade,
        observacoes: editedMaterial.observacoes || ''
      });
      await fetchMateriais(editedMaterial.rota_id);
      setSnackbar({ open: true, message: 'Material atualizado com sucesso!', severity: 'success' });
      setEditMaterialDialogOpen(false);
      setEditedMaterial(null);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao atualizar material: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'), severity: 'error' });
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ destino: '', material: '', status: '' });
    setPage(0);
  };

  // Sem toggle de expansão

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Carregando envios...</Typography>
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
            <LocalShippingIcon sx={{ fontSize: '2rem' }} />
            Meus Envios
          </Typography>
        </Box>

        {/* Filtros */}
        <Paper elevation={0} sx={{ p: 1, mb: 1.5, border: (theme) => `1px solid ${theme.palette.grey[200]}`, borderRadius: 1 }}>
          <Grid container spacing={1} columns={12}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Destino" value={filters.destino} onChange={(e)=>handleFilterChange('destino', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Material" value={filters.material} onChange={(e)=>handleFilterChange('material', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="entregue">Entregue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display:'flex', alignItems:'center', justifyContent:{ xs:'flex-start', md:'flex-end' } }}>
              <Tooltip title="Limpar filtros">
                <IconButton size="small" onClick={clearFilters} aria-label="Limpar filtros">
                  <FilterAltOffIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabela única: cabeçalho + materiais (todas as rotas filtradas) */}
        {(() => {
          const fDes = filters.destino.trim().toLowerCase();
          const fMat = (filters.material || '').trim().toLowerCase();
          const fStatus = (filters.status || '').trim().toLowerCase();

          const filteredRotas = [...rotas]
            .filter((r) => {
              const meusMatsAll = (materiaisPorRota[r.id] || []).filter(m => String(m.user_id) === String(user?.userId));
              const meusMats = !fStatus ? meusMatsAll : meusMatsAll.filter(m => (m?.status || 'pendente').toLowerCase() === fStatus);
              const meusMateriais = meusMats.length > 0;
              const destinosMateriais = meusMats.map(m => getCidadeNome(m.cidade_destino_id).toLowerCase());
              const matchDestino = !fDes || destinosMateriais.some(n => n.includes(fDes));
              const matchMaterial = !fMat || meusMats.some(m => {
                const tipo = String(m?.tipo || '').toLowerCase();
                const obs = String(m?.observacoes || '').toLowerCase();
                const qt = m?.quantidade != null ? String(m.quantidade).toLowerCase() : '';
                return tipo.includes(fMat) || obs.includes(fMat) || qt.includes(fMat);
              });
              return matchDestino && meusMateriais && matchMaterial;
            })
            .sort((a, b) => {
              const rank = { Agendada: 0, Andamento: 1, Concluida: 2, Cancelada: 3 };
              const ra = rank[a?.status] ?? 99;
              const rb = rank[b?.status] ?? 99;
              if (ra !== rb) return ra - rb;
              const da = a?.data_saida ? new Date(a.data_saida).getTime() : 0;
              const db = b?.data_saida ? new Date(b.data_saida).getTime() : 0;
              return da - db;
            });

          const allRows = filteredRotas.flatMap((rota) =>
            (materiaisPorRota[rota.id] || [])
              .filter((material) => String(material.user_id) === String(user?.userId))
              .map((material) => ({ rota, material }))
          );

          const anyLoading = filteredRotas.some((r) => loadingMateriais[r.id]);
          // Ordenar por status do material: pendente primeiro, depois entregue, depois demais
          const statusRank = { pendente: 0, entregue: 1 };
          const sortedRows = [...allRows].sort((a, b) => {
            const sa = (a.material?.status || 'pendente').toLowerCase();
            const sb = (b.material?.status || 'pendente').toLowerCase();
            const ra = statusRank[sa] ?? 2;
            const rb = statusRank[sb] ?? 2;
            if (ra !== rb) return ra - rb;
            // tie-breaker opcional por tipo para estabilidade visual
            return String(a.material?.tipo || '').localeCompare(String(b.material?.tipo || ''));
          });

          const pagedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

          return (
            <TableContainer>
              <Table size="small" sx={{ minWidth: 800, backgroundColor:'#fff', '& .MuiTableCell-root':{ borderBottom:(theme)=>`1px solid ${theme.palette.divider}`, padding:'8px 16px' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 180 }}>Rota</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Tipo</TableCell>
                    <TableCell align="right" sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 110 }}>Quantidade</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 160 }}>Destino do Material</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px' }}>Observações</TableCell>
                    <TableCell align="right" sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 500, whiteSpace: 'nowrap', padding: '8px 16px', width: 90 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {anyLoading && allRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                          <CircularProgress size={20} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : allRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                          Nenhum material encontrado com os filtros atuais.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedRows.map(({ rota, material }) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          {rota?.identificacao ? (
                            <Typography variant="body2" title={`ID #${rota?.id}`}>{rota.identificacao}</Typography>
                          ) : (
                            <>#{rota?.id}</>
                          )}
                        </TableCell>
                        <TableCell>{material.tipo}</TableCell>
                        <TableCell align="right">{material.quantidade}</TableCell>
                        <TableCell>{getCidadeNome(material.cidade_destino_id)}</TableCell>
                        <TableCell>{material.observacoes || 'N/A'}</TableCell>
                        <TableCell align="right">
                          {material?.status === 'entregue' ? (
                            <Chip label="entregue" color="success" size="small" />
                          ) : (
                            <Chip label={material?.status || 'pendente'} color={material?.status === 'pendente' ? 'warning' : 'default'} size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          );
        })()}

        <TablePagination
          component="div"
          count={(function(){
            const fDes = filters.destino.trim().toLowerCase();
            const fMat = (filters.material || '').trim().toLowerCase();
            const fStatus = (filters.status || '').trim().toLowerCase();
            const filteredRotas = [...rotas].filter((r) => {
              const meusMatsAll = (materiaisPorRota[r.id] || []).filter(m => String(m.user_id) === String(user?.userId));
              const meusMats = !fStatus ? meusMatsAll : meusMatsAll.filter(m => (m?.status || 'pendente').toLowerCase() === fStatus);
              const meusMateriais = meusMats.length > 0;
              const destinosMateriais = meusMats.map(m => getCidadeNome(m.cidade_destino_id).toLowerCase());
              const matchDestino = !fDes || destinosMateriais.some(n => n.includes(fDes));
              const matchMaterial = !fMat || meusMats.some(m => {
                const tipo = String(m?.tipo || '').toLowerCase();
                const obs = String(m?.observacoes || '').toLowerCase();
                const qt = m?.quantidade != null ? String(m.quantidade).toLowerCase() : '';
                return tipo.includes(fMat) || obs.includes(fMat) || qt.includes(fMat);
              });
              return matchDestino && meusMateriais && matchMaterial;
            });
            const allRows = filteredRotas.flatMap((rota) => (materiaisPorRota[rota.id] || []).filter(m => String(m.user_id) === String(user?.userId) && (!fStatus || (m?.status || 'pendente').toLowerCase() === fStatus)));
            return allRows.length;
          })()}
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

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog: Editar Material */}
      <Dialog open={editMaterialDialogOpen} onClose={() => setEditMaterialDialogOpen(false)}>
        <DialogTitle>Editar Material</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Tipo" value={editedMaterial?.tipo || ''} onChange={(e) => setEditedMaterial(prev => ({ ...prev, tipo: e.target.value }))} fullWidth />
            <TextField label="Quantidade" type="number" value={editedMaterial?.quantidade || ''} onChange={(e) => setEditedMaterial(prev => ({ ...prev, quantidade: e.target.value }))} fullWidth />
            <TextField label="Observações" value={editedMaterial?.observacoes || ''} onChange={(e) => setEditedMaterial(prev => ({ ...prev, observacoes: e.target.value }))} multiline rows={4} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMaterialDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveMaterial} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EnviosPage;
