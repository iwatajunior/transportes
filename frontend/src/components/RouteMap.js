import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, IconButton, TextField, Autocomplete, CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { DirectionsBus, LocationOn, ArrowForward, LocalShipping as LocalShippingIcon, Edit, CalendarToday, Forward as ForwardIcon, Close, Delete as DeleteIcon, Add as AddIcon, DoubleArrow } from '@mui/icons-material';
import api from '../services/api';
import { cidadesPI } from '../services/cidadesPI';
import { RouteStatus } from '../constants/routeStatus';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Polyline, Marker, LoadScript } from '@react-google-maps/api';

// Função para obter a cor do status
const getStatusColor = (status) => {
  switch (status) {
    case RouteStatus.AGENDADA:
      return 'primary';
    case RouteStatus.ANDAMENTO:
      return 'warning';
    case RouteStatus.CONCLUIDA:
      return 'success';
    case RouteStatus.CANCELADA:
      return 'error';
    default:
      return 'default';
  }
};

// Componente para desenhar a rota no mapa
const RoutePath = ({ rota, onClick }) => {
  const getCidadeCoords = (cidadeId) => {
    const cidade = cidadesPI.find(c => String(c.id) === String(cidadeId));
    return cidade ? { lat: cidade.latitude, lng: cidade.longitude } : null;
  };

  const path = [
    getCidadeCoords(rota.cidade_origem),
    ...(rota.cidades_intermediarias_ida || []).map(getCidadeCoords).filter(Boolean),
    getCidadeCoords(rota.cidade_destino),
    ...(rota.cidades_intermediarias_volta || []).map(getCidadeCoords).filter(Boolean).reverse(),
    getCidadeCoords(rota.cidade_origem)
  ].filter(Boolean);

  return (
    <>
      <Polyline
        path={path}
        options={{
          strokeColor: '#1976d2',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          clickable: true,
          onClick: onClick
        }}
      />
      {/* Marcadores para origem e destino */}
      <Marker
        position={getCidadeCoords(rota.cidade_origem)}
        icon={{
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: '#1976d2',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 90
        }}
      />
      <Marker
        position={getCidadeCoords(rota.cidade_destino)}
        icon={{
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: '#c2185b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: -90
        }}
      />
    </>
  );
};

const RouteMap = ({ rotas, currentPage = 1, itemsPerPage = 2 }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentRotas, setCurrentRotas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRota, setSelectedRota] = useState(null);
  const [selectedCidade, setSelectedCidade] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedRota, setEditedRota] = useState(null);
  const [cidades, setCidades] = useState(cidadesPI);
  const [materiaisPorRota, setMateriaisPorRota] = useState({});
  const [loadingMateriais, setLoadingMateriais] = useState({});
  const [materialInfo, setMaterialInfo] = useState({
    tipo: '',
    quantidade: '',
    peso: '',
    observacoes: '',
    rota_id: '',
    cidade_origem_id: '',
    cidade_destino_id: ''
  });
  const [materiais, setMateriais] = useState([]);
  const [editMaterialDialogOpen, setEditMaterialDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editedMaterial, setEditedMaterial] = useState(null);
  const [openMaterialDialog, setOpenMaterialDialog] = useState(false);

  useEffect(() => {
    console.log('Rotas recebidas:', rotas);
    
    // Calcular o índice inicial e final para a paginação
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Atualizar as rotas visíveis
    const currentRotas = rotas.slice(startIndex, endIndex);
    console.log('Rotas paginadas:', currentRotas);
    setCurrentRotas(currentRotas);
    setLoading(false); // Garantir que o loading seja false após processar as rotas
  }, [rotas, currentPage, itemsPerPage]);

  // Configuração do mapa
  const center = {
    lat: -5.08921, // Latitude central do Piauí
    lng: -42.8096  // Longitude central do Piauí
  };

  const mapStyles = [
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#7c93a3' }, { lightness: '-10' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }]
    },
    {
      featureType: 'all',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }, { lightness: 20 }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#000000' }, { lightness: 17 }, { weight: 1.2 }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 20 }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 21 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }, { lightness: 17 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#000000' }, { lightness: 29 }, { weight: 0.2 }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 18 }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 16 }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 19 }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 17 }]
    }
  ];

  const fetchMateriais = async (rotaId) => {
    try {
      if (!user) {
        setSnackbar({
          open: true,
          message: 'Você precisa estar logado para ver os materiais.',
          severity: 'warning'
        });
        return;
      }

      console.log('=== fetchMateriais ===');
      console.log('Token no localStorage:', localStorage.getItem('token'));
      console.log('Buscando materiais para rota:', rotaId);
      console.log('URL da API:', `${api.defaults.baseURL}/materials/rota/${rotaId}`);
      
      setLoadingMateriais(prev => ({ ...prev, [rotaId]: true }));
      const response = await api.get(`/materials/rota/${rotaId}`);
      console.log('Resposta da API para materiais:', response.data);
      setMateriaisPorRota(prev => {
        const newState = { ...prev, [rotaId]: response.data };
        console.log('Novo estado de materiaisPorRota:', newState);
        return newState;
      });
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      console.error('Detalhes do erro:', error.response?.data);
      console.error('Status do erro:', error.response?.status);
      setSnackbar({
        open: true,
        message: 'Erro ao buscar materiais: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'),
        severity: 'error'
      });
    } finally {
      setLoadingMateriais(prev => ({ ...prev, [rotaId]: false }));
    }
  };



  const getCidadeNome = (id) => {
    const cidade = cidadesPI.find(c => String(c.id) === String(id));
    return cidade ? cidade.nome : id;
  };

  const handleOpenMaterialDialog = () => {
    setMaterialInfo({
      tipo: '',
      quantidade: '',
      peso: '',
      observacoes: '',
      rota_id: '',
      cidade_origem_id: '',
      cidade_destino_id: ''
    });
    setOpenMaterialDialog(true);
  };

  const handleCloseMaterialDialog = () => {
    setOpenMaterialDialog(false);
    setMaterialInfo({
      tipo: '',
      quantidade: '',
      peso: '',
      observacoes: '',
      rota_id: '',
      cidade_origem_id: '',
      cidade_destino_id: ''
    });
  };

  const handleConfirmarInteresse = async () => {
    if (!materialInfo.rota_id) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecione uma rota',
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await api.post('/materials', {
        rota_id: materialInfo.rota_id,
        cidade_origem_id: materialInfo.cidade_origem_id,
        cidade_destino_id: materialInfo.cidade_destino_id,
        tipo: materialInfo.tipo,
        quantidade: materialInfo.quantidade,
        peso: materialInfo.peso,
        observacoes: materialInfo.observacoes
      });

      if (response.status === 201) {
        setSnackbar({ 
          open: true, 
          message: 'Material registrado com sucesso!', 
          severity: 'success' 
        });
        handleCloseMaterialDialog();
        // Atualizar a lista de materiais da rota selecionada
        fetchMateriais(materialInfo.rota_id);
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Erro ao registrar material: ' + (error.message || 'Erro desconhecido'), 
        severity: 'error' 
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditClick = (rota) => {
    console.log('Editando rota:', rota);
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

      setLoading(false);
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

  const handleRotaClick = (rota) => {
    setSelectedRota(rota);
  };

  const handleClose = () => {
    setSelectedRota(null);
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

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Tem certeza que deseja excluir este material?')) {
      try {
        await api.delete(`/materials/${materialId}`);
        setSnackbar({
          open: true,
          message: 'Material excluído com sucesso!',
          severity: 'success'
        });
        // Atualizar a lista de materiais
        if (selectedRota) {
          fetchMateriais(selectedRota.id);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Erro ao excluir material: ' + (error.response?.data?.error || error.message),
          severity: 'error'
        });
      }
    }
  };

  const handleSaveMaterial = async () => {
    try {
      setLoading(false);
      const response = await api.put(`/materials/${selectedMaterial.id}`, editedMaterial);
      setSnackbar({
        open: true,
        message: 'Material atualizado com sucesso!',
        severity: 'success'
      });
      setEditMaterialDialogOpen(false);
      // Atualizar a lista de materiais
      if (selectedRota) {
        setLoadingMateriais(prev => ({ ...prev, [selectedRota.id]: true }));
        fetchMateriais(selectedRota.id);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar material: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Carregando rotas...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2', textAlign: 'left' }}>
        Rotas Programadas
      </Typography>
      {currentRotas.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          py: 4,
          px: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <LocalShippingIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              textAlign: 'center',
              fontWeight: 500,
              mb: 1
            }}
          >
            Nenhuma rota ativa no momento
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              textAlign: 'center',
              maxWidth: '400px'
            }}
          >
            Aguarde até que uma nova rota seja cadastrada.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1}>
          {currentRotas.map((rota) => {
            const materiais = materiaisPorRota[rota.id] || [];
            const isLoadingMateriais = loadingMateriais[rota.id];
            
            return (
              <Grid item xs={12} key={rota.id}>
                <Paper elevation={3} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: 14 }}>
                        <strong>Rota:</strong> {rota.identificacao}
                      </span>
                      <Chip
                        label={rota.status}
                        color={getStatusColor(rota.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Cidade de Origem</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ color: '#1976d2' }} />
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{getCidadeNome(rota.cidade_origem)}</Typography>
                        </Box>
                      </Box>
                      <LocalShippingIcon sx={{ color: '#1976d2', mx: 4, mt: 2 }} />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Cidade de Destino</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{getCidadeNome(rota.cidade_destino)}</Typography>
                          <LocationOn sx={{ color: '#c2185b' }} />
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <span style={{ fontSize: 14 }}>
                        Saída: {new Date(rota.data_saida).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: 14 }}>
                        Retorno: {new Date(rota.data_retorno).toLocaleDateString()}
                      </span>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, mt: 2 }}>
                    {/* Percurso de Ida */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Percurso de Ida
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Chip label={getCidadeNome(rota.cidade_origem)} size="small" color="primary" variant="outlined" icon={<LocationOn sx={{ fontSize: 16 }} />} />
                        {(rota.cidades_intermediarias_ida || []).map((cid, idx) => (
                          <React.Fragment key={idx}>
                            <DoubleArrow sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Chip label={getCidadeNome(cid)} size="small" color="primary" variant="outlined" icon={<LocationOn sx={{ fontSize: 16 }} />} />
                          </React.Fragment>
                        ))}
                        <DoubleArrow sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Chip label={getCidadeNome(rota.cidade_destino)} size="small" color="primary" variant="outlined" icon={<LocationOn sx={{ fontSize: 16 }} />} />
                      </Box>
                    </Box>

                    {/* Separador Vertical */}
                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

                    {/* Percurso de Retorno */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Percurso de Retorno
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Chip label={getCidadeNome(rota.cidade_origem)} size="small" color="secondary" variant="outlined" icon={<LocationOn sx={{ fontSize: 16 }} />} />
                        {(rota.cidades_intermediarias_volta || []).map((cid, idx) => (
                          <React.Fragment key={idx}>
                            <DoubleArrow sx={{ fontSize: 16, color: 'secondary.main', transform: 'rotate(180deg)' }} />
                            <Chip label={getCidadeNome(cid)} size="small" color="secondary" variant="outlined" icon={<LocationOn sx={{ fontSize: 16 }} />} />
                          </React.Fragment>
                        ))}
                        <DoubleArrow sx={{ fontSize: 16, color: 'secondary.main', transform: 'rotate(180deg)' }} />
                        <Chip label={getCidadeNome(rota.cidade_destino)} size="small" color="secondary" variant="outlined" icon={<LocationOn sx={{ fontSize: 16 }} />} />
                      </Box>
                    </Box>
                  </Box>
                  <Grid container spacing={1}>
                    {/* Seção de Materiais */}
                    <Grid item xs={12}>
                      {isLoadingMateriais ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                          <CircularProgress size={20} />
                        </Box>
                      ) : materiais.length > 0 && (
                        <TableContainer component={Paper} sx={{ mt: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Origem</TableCell>
                                <TableCell>Destino</TableCell>
                                <TableCell align="right">Quantidade</TableCell>
                                <TableCell>Requisitante</TableCell>
                                <TableCell align="center">Ações</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {materiais.map((material) => (
                                <TableRow key={material.id}>
                                  <TableCell>{material.tipo}</TableCell>
                                  <TableCell>{getCidadeNome(material.cidade_origem_id)}</TableCell>
                                  <TableCell>{getCidadeNome(material.cidade_destino_id)}</TableCell>
                                  <TableCell align="right">{Number(material.quantidade).toFixed(1)}</TableCell>
                                  <TableCell>{material.requisitante}</TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditMaterial(material)}
                                      color="primary"
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteMaterial(material.id)}
                                      color="error"
                                    >
                                      <DeleteIcon fontSize="small" />
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
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
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

      <Dialog open={openMaterialDialog} onClose={handleCloseMaterialDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Enviar Material</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Selecione a Rota</InputLabel>
              <Select
                value={materialInfo.rota_id}
                onChange={(e) => {
                  const selectedRotaId = e.target.value;
                  const selectedRota = rotas.find(r => r.id === selectedRotaId);
                  if (selectedRota) {
                    setMaterialInfo(prev => ({
                      ...prev,
                      rota_id: selectedRotaId,
                      cidade_origem_id: selectedRota.cidade_origem,
                      cidade_destino_id: selectedRota.cidade_destino
                    }));
                  }
                }}
                label="Selecione a Rota"
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Selecione uma rota</em>
                </MenuItem>
                {rotas.filter(r => r.status === 'ativo').map((rota) => (
                  <MenuItem key={rota.id} value={rota.id}>
                    Rota {rota.identificacao} - {getCidadeNome(rota.cidade_origem)} → {getCidadeNome(rota.cidade_destino)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Tipo"
              value={materialInfo.tipo}
              onChange={(e) => setMaterialInfo(prev => ({ ...prev, tipo: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Quantidade"
              type="number"
              value={materialInfo.quantidade}
              onChange={(e) => setMaterialInfo(prev => ({ ...prev, quantidade: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Peso"
              type="number"
              value={materialInfo.peso}
              onChange={(e) => setMaterialInfo(prev => ({ ...prev, peso: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Observações"
              value={materialInfo.observacoes}
              onChange={(e) => setMaterialInfo(prev => ({ ...prev, observacoes: e.target.value }))}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMaterialDialog}>Cancelar</Button>
          <Button 
            onClick={handleConfirmarInteresse} 
            variant="contained" 
            color="primary"
            disabled={!materialInfo.rota_id || !materialInfo.tipo || !materialInfo.quantidade}
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RouteMap; 