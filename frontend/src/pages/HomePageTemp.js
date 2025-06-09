import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Link as RouterLink, Paper, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Snackbar, Alert } from '@mui/material';
import { Pagination } from '@mui/material';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);

  const indexOfLastRota = currentPage * itemsPerPage;
  const indexOfFirstRota = indexOfLastRota - itemsPerPage;
  const currentRotas = rotas.slice(indexOfFirstRota, indexOfLastRota);
  const totalPages = Math.ceil(rotas.length / itemsPerPage);

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
    return isValid;
  };

  const handleInteresseClick = (rota) => {
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
      ...((rota.cidades_intermediarias_ida || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) })));
      { id: rota.cidade_destino, nome: getCidadeNome(rota.cidade_destino) },
      ...((rota.cidades_intermediarias_volta || []).map(cid => ({ id: cid, nome: getCidadeNome(cid) })))
    ];
    
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
    <Container>
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<AddIcon sx={{ fontSize: 28 }} />}
              onClick={() => history.push('/criar-rota')}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Criar Nova Rota</Typography>
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
              startIcon={<ListIcon sx={{ fontSize: 28 }} />}
              onClick={() => history.push('/gerenciarviagens')}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Gerenciar Viagens</Typography>
            </Button>
          </Grid>
        </Grid>

        <RouteMap />

        <Dialog 
          open={openEncomendaDialog} 
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">Enviar Encomenda</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Rota</InputLabel>
                <Select
                  value={selectedRota}
                  onChange={handleRotaChange}
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
                  onChange={handleCidadeChange}
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
                rows={4}
                value={materialInfo.observacoes}
                onChange={(e) => setMaterialInfo({...materialInfo, observacoes: e.target.value})}
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancelar</Button>
            <Button onClick={handleConfirmarEncomenda} variant="contained" color="primary">
              Confirmar Envio
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Rotas Programadas
          </Typography>
          <Grid container spacing={2}>
            {currentRotas.map((rota) => (
              <Grid item xs={12} sm={6} md={4} key={rota.id}>
                <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {rota.identificacao}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Origem: {getCidadeNome(rota.cidade_origem)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Destino: {getCidadeNome(rota.cidade_destino)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data Saída: {new Date(rota.data_saida).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data Retorno: {new Date(rota.data_retorno).toLocaleDateString()}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => handleInteresseClick(rota)}
                    sx={{ mt: 2 }}
                  >
                    Enviar Encomenda
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </Box>

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
      </Box>
    </Container>
  );
};

export default HomePage;
