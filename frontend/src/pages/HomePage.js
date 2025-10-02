import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Link as RouterLink, Paper, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Snackbar, Alert } from '@mui/material';
import { Pagination } from '@mui/material'; // Adicionado para paginação
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
  Send as SendIcon,
  Luggage as LuggageIcon,
  Poll as PollIcon
} from '@mui/icons-material';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RouteMap from '../components/RouteMap';
import api from '../services/api';
import { cidadesPI } from '../services/cidadesPI';
import HomeSandboxPage from './HomeSandboxPage';

const BUTTON_COLOR = '#FFA500';

const HomePage = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [rotas, setRotas] = useState([]);
  const [rotasFiltradas, setRotasFiltradas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);
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
        setLoading(true); // Adicionado para garantir que o loading seja true durante a requisição
        const response = await api.get('/routes?home=true');
        const rotasData = response.data || [];
        
        // Verificar se a resposta tem dados
        if (!rotasData || !Array.isArray(rotasData)) {
          console.error('Resposta inválida da API:', rotasData);
          throw new Error('Resposta inválida da API');
        }

        // Ordenar as rotas por status
        const rotasFiltradas = rotasData
          .sort((a, b) => {
            const statusOrder = { 
              'agendada': 1, 
              'andamento': 2,
              'concluida': 3,
              'cancelada': 4
            };
            const statusA = statusOrder[a.status.toLowerCase()] || 99;
            const statusB = statusOrder[b.status.toLowerCase()] || 99;
            return statusA - statusB;
          });

        console.log('Rotas ordenadas:', rotasFiltradas);

        console.log('Rotas filtradas:', rotasFiltradas);
        
        setRotas(rotasData);
        setRotasFiltradas(rotasFiltradas);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar rotas:', err);
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
  };  const getCidadesRota = (rota) => {
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

  // Evitar bloquear a página inteira: tratar loading/erro apenas na seção de rotas

  return (
    <Box sx={{ p: 0 }}>
      <HomeSandboxPage hideRotasProgramadas={true} hidePainelViagens={true} hideFiltros={true} headerFirst={true} forceTestMode={true} />
    </Box>
  );
};

export default HomePage;
