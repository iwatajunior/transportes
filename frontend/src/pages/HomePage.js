import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Link as RouterLink, Paper, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Snackbar, Alert } from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Dashboard as DashboardIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  DirectionsBus as BusIcon,
  Edit as EditIcon,
  LocationOn,
  ArrowForward,
  Send as SendIcon
} from '@mui/icons-material';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RouteMap from '../components/RouteMap';
import api from '../services/api';
import { cidadesPI } from '../services/cidadesPI';

const BUTTON_COLOR = '#FFA500';

const HomePage = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openEncomendaDialog, setOpenEncomendaDialog] = useState(false);
  const [selectedRota, setSelectedRota] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('');
  const [materialInfo, setMaterialInfo] = useState({
    tipo: '',
    quantidade: '',
    observacoes: '',
    cidade_destino: ''
  });

  useEffect(() => {
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

    fetchRotas();
  }, []);

  const getCidadeNome = (id) => {
    const cidade = cidadesPI.find(c => String(c.id) === String(id));
    return cidade ? cidade.nome : id;
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEncomendaClick = () => {
    setOpenEncomendaDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEncomendaDialog(false);
    setSelectedRota(null);
    setSelectedCidade('');
    setMaterialInfo({
      tipo: '',
      quantidade: '',
      observacoes: '',
      cidade_destino: ''
    });
  };

  const handleRotaChange = (event) => {
    setSelectedRota(event.target.value);
    setSelectedCidade('');
  };

  const handleCidadeChange = (event) => {
    setSelectedCidade(event.target.value);
  };

  const handleMaterialChange = (event) => {
    setMaterialInfo({
      ...materialInfo,
      [event.target.name]: event.target.value
    });
  };

  const handleConfirmarEncomenda = async () => {
    try {
      if (!selectedRota || !selectedCidade || !materialInfo.cidade_destino || !materialInfo.tipo || !materialInfo.quantidade) {
        setSnackbar({
          open: true,
          message: 'Por favor, preencha todos os campos obrigatórios',
          severity: 'warning'
        });
        return;
      }

      const response = await api.post('/materials', {
        rota_id: selectedRota.id,
        cidade_origem_id: selectedRota.cidade_origem,
        cidade_destino_id: materialInfo.cidade_destino,
        tipo: materialInfo.tipo,
        quantidade: parseFloat(materialInfo.quantidade),
        observacoes: materialInfo.observacoes || '',
        user_id: user.userId
      });

      if (response.status === 201) {
        setSnackbar({ 
          open: true, 
          message: 'Material registrado com sucesso!', 
          severity: 'success' 
        });
        handleDialogClose();
      }
    } catch (error) {
      console.error('Erro ao registrar material:', error);
      setSnackbar({ 
        open: true, 
        message: 'Erro ao registrar material: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'), 
        severity: 'error' 
      });
    }
  };

  const isFormValid = () => {
    const isValid = selectedCidade && 
                   materialInfo.tipo && 
                   materialInfo.quantidade && 
                   materialInfo.cidade_destino;
    
    console.log('Validação do formulário:', {
      selectedCidade,
      tipo: materialInfo.tipo,
      quantidade: materialInfo.quantidade,
      cidade_destino: materialInfo.cidade_destino,
      isValid
    });
    
    return isValid;
  };

  const handleInteresseClick = (rota) => {
    console.log('Rota selecionada:', rota);
    setSelectedRota(rota);
    setSelectedCidade('');
    setMaterialInfo({
      tipo: '',
      quantidade: '',
      observacoes: '',
      cidade_destino: ''
    });
    setOpenEncomendaDialog(true);
  };

  const getCidadesRota = (rota) => {
    if (!rota) return [];
    
    const cidadesRota = [
      { id: rota.cidade_origem, nome: getCidadeNome(rota.cidade_origem) },
      ...((rota.cidades_intermediarias_ida || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) }))),
      { id: rota.cidade_destino, nome: getCidadeNome(rota.cidade_destino) },
      ...((rota.cidades_intermediarias_volta || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) })))
    ];
    
    // Remove duplicatas mantendo apenas a primeira ocorrência
    return cidadesRota.filter((c, idx, arr) => arr.findIndex(x => x.id === c.id) === idx);
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

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: '2px',
        mt: '2px'
      }}
    >
      <Container maxWidth="lg" sx={{ py: 1 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            variant="h5" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontFamily: "'Exo 2', sans-serif", 
              fontWeight: 'bold',
              color: '#1976d2',
              mb: 0.5
            }}
          >
            {user?.nome ? `Bem-vindo, ${user.nome}!` : 'Bem-vindo ao Rotas e Viagens!'}
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontFamily: "'Exo 2', sans-serif",
              color: 'text.secondary',
              mt: 0
            }}
          >
            Gerencie suas viagens e envios de encomendas aqui.
          </Typography>
        </Box>

        {/* Main Actions Grid */}
        <Grid container spacing={2}>
          {/* Primary Actions */}
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<LocalShippingIcon sx={{ fontSize: 28 }} />}
              onClick={() => history.push('/cadastrar-rota')}
              sx={{
                bgcolor: '#FF9800',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: '#F57C00'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Nova Rota</Typography>
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<EditIcon sx={{ fontSize: 28 }} />}
              onClick={() => history.push('/rotas')}
              sx={{
                bgcolor: '#FF9800',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: '#F57C00'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Editar Rotas</Typography>
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<AddIcon sx={{ fontSize: 28 }} />}
              onClick={() => history.push('/registrar-viagem')}
              sx={{
                bgcolor: '#FF9800',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: '#F57C00'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Nova Viagem</Typography>
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
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
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: '#F57C00'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Painel de Viagens</Typography>
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<DashboardIcon sx={{ fontSize: 28 }} />}
              onClick={() => history.push('/admin/dashboard')}
              sx={{
                bgcolor: '#FF9800',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: '#F57C00'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Dashboard</Typography>
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
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
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: '#F57C00'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Veículos</Typography>
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<PersonIcon sx={{ fontSize: 28 }} />}
              onClick={() => history.push('/usuarios')}
              sx={{
                bgcolor: '#FF9800',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: '#F57C00'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Usuários</Typography>
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<SendIcon sx={{ fontSize: 28 }} />}
              onClick={handleEncomendaClick}
              sx={{
                bgcolor: '#FF9800',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  transform: 'scale(1.02)',
                  bgcolor: '#F57C00'
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Envie Encomendas</Typography>
            </Button>
          </Grid>
        </Grid>

        <RouteMap />

        {/* Dialog para Envio de Encomendas */}
        <Dialog 
          open={openEncomendaDialog} 
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon color="primary" />
              <Typography variant="h6">Enviar Material</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Rota: {selectedRota?.identificacao}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {getCidadeNome(selectedRota?.cidade_origem)} → {getCidadeNome(selectedRota?.cidade_destino)}
              </Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Rota</InputLabel>
                <Select
                  value={selectedRota?.id || ''}
                  onChange={(e) => {
                    const rota = rotas.find(r => r.id === e.target.value);
                    setSelectedRota(rota);
                    setSelectedCidade('');
                    setMaterialInfo({
                      tipo: '',
                      quantidade: '',
                      observacoes: '',
                      cidade_destino: ''
                    });
                  }}
                  label="Rota"
                >
                  {rotas.map((rota) => (
                    <MenuItem key={rota.id} value={rota.id}>
                      {rota.identificacao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cidade de Coleta do Material</InputLabel>
                <Select
                  value={selectedCidade}
                  onChange={e => setSelectedCidade(e.target.value)}
                  label="Cidade de Coleta do Material"
                >
                  {selectedRota && getCidadesRota(selectedRota).map(cidade => (
                    <MenuItem key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cidade de Destino do Material</InputLabel>
                <Select
                  value={materialInfo.cidade_destino}
                  onChange={e => setMaterialInfo({...materialInfo, cidade_destino: e.target.value})}
                  label="Cidade de Destino do Material"
                >
                  {selectedRota && getCidadesRota(selectedRota).map(cidade => (
                    <MenuItem key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Tipo de Material"
                value={materialInfo.tipo}
                onChange={(e) => setMaterialInfo({...materialInfo, tipo: e.target.value})}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Quantidade"
                type="number"
                value={materialInfo.quantidade}
                onChange={(e) => setMaterialInfo({...materialInfo, quantidade: e.target.value})}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={materialInfo.observacoes}
                onChange={(e) => setMaterialInfo({...materialInfo, observacoes: e.target.value})}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancelar</Button>
            <Button 
              onClick={handleConfirmarEncomenda} 
              disabled={!isFormValid()} 
              variant="contained"
            >
              Confirmar Envio
            </Button>
          </DialogActions>
        </Dialog>

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
    </Box>
  );
};

export default HomePage;
