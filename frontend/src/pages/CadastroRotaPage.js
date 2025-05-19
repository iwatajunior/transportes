import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import api from '../services/api';
import { getCidadesPI } from '../services/cidadesAPI';

const CadastroRotaPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    cidades: [],
    dataSaida: '',
    horarioSaida: '',
    dataRetorno: '',
    horarioRetorno: '',
    motorista: '',
    veiculo: ''
  });

  const [cidades, setCidades] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);

  useEffect(() => {
    // Carregar cidades do Piauí
    const cidadesPI = getCidadesPI();
    setCidades(cidadesPI);

    // Carregar motoristas e veículos disponíveis
    carregarMotoristasVeiculos();
  }, []);

  const carregarMotoristasVeiculos = async () => {
    try {
      const [motoristasResponse, veiculosResponse] = await Promise.all([
        api.get('/motoristas'),
        api.get('/veiculos')
      ]);
      setMotoristas(motoristasResponse.data);
      setVeiculos(veiculosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar motoristas e veículos:', error);
      setError('Erro ao carregar motoristas e veículos. Por favor, tente novamente.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCidade = (cidade) => {
    setFormData(prev => ({
      ...prev,
      cidades: [...prev.cidades, cidade]
    }));
  };

  const handleRemoveCidade = (cidadeId) => {
    setFormData(prev => ({
      ...prev,
      cidades: prev.cidades.filter(c => c.id !== cidadeId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar se todas as cidades são diferentes
      const cidadesUnicas = [...new Set(formData.cidades.map(c => c.id))];
      if (cidadesUnicas.length !== formData.cidades.length) {
        throw new Error('Não é permitido selecionar a mesma cidade mais de uma vez.');
      }

      // Validar se tem pelo menos duas cidades
      if (formData.cidades.length < 2) {
        throw new Error('É necessário selecionar pelo menos duas cidades.');
      }

      // Validar se data de retorno é maior que data de saída
      const dataSaida = new Date(`${formData.dataSaida} ${formData.horarioSaida}`);
      const dataRetorno = new Date(`${formData.dataRetorno} ${formData.horarioRetorno}`);
      if (dataRetorno <= dataSaida) {
        throw new Error('A data de retorno deve ser posterior à data de saída.');
      }

      // Preparar dados para envio
      const rotaData = {
        cidades: formData.cidades,
        dataSaida: format(new Date(`${formData.dataSaida} ${formData.horarioSaida}`), 'yyyy-MM-dd HH:mm:ss'),
        dataRetorno: format(new Date(`${formData.dataRetorno} ${formData.horarioRetorno}`), 'yyyy-MM-dd HH:mm:ss'),
        motorista: formData.motorista,
        veiculo: formData.veiculo
      };

      // Enviar para a API
      await api.post('/rotas', rotaData);
      setSuccess('Rota cadastrada com sucesso!');
      // Limpar formulário após sucesso
      setFormData({
        cidades: [],
        dataSaida: '',
        horarioSaida: '',
        dataRetorno: '',
        horarioRetorno: '',
        motorista: '',
        veiculo: ''
      });
      // Redirecionar para a página inicial após 2 segundos
      setTimeout(() => {
        history.push('/');
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar rota:', error);
      setError(error.response?.data?.message || 'Erro ao cadastrar rota. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Cadastro de Rota
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Cidades */}
            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Cidades da Rota
                </Typography>
                <Select
                  fullWidth
                  value={formData.cidades.map(c => c.id)}
                  onChange={(e) => {
                    const selectedCidadeId = parseInt(e.target.value);
                    const selectedCidade = cidades.find(c => c.id === selectedCidadeId);
                    if (selectedCidade) {
                      handleAddCidade(selectedCidade);
                    }
                  }}
                  renderValue={() => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.cidades.map((cidade) => (
                        <Button
                          key={cidade.id}
                          variant="outlined"
                          onClick={() => handleRemoveCidade(cidade.id)}
                          sx={{ mr: 1, mb: 1 }}
                        >
                          {cidade.nome}
                          <Box component="span" sx={{ ml: 1 }}>
                            ×
                          </Box>
                        </Button>
                      ))}
                    </Box>
                  )}
                >
                  {cidades.map((cidade) => (
                    <MenuItem key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Grid>

            {/* Data e Horário de Saída */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data de Saída"
                type="date"
                name="dataSaida"
                value={formData.dataSaida}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Horário de Saída"
                type="time"
                name="horarioSaida"
                value={formData.horarioSaida}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Data e Horário de Retorno */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data de Retorno"
                type="date"
                name="dataRetorno"
                value={formData.dataRetorno}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Horário de Retorno"
                type="time"
                name="horarioRetorno"
                value={formData.horarioRetorno}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Motorista */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Motorista</InputLabel>
                <Select
                  name="motorista"
                  value={formData.motorista}
                  onChange={handleInputChange}
                  label="Motorista"
                  required
                >
                  {motoristas.map((motorista) => (
                    <MenuItem key={motorista.id} value={motorista.id}>
                      {motorista.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Veículo */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Veículo</InputLabel>
                <Select
                  name="veiculo"
                  value={formData.veiculo}
                  onChange={handleInputChange}
                  label="Veículo"
                  required
                >
                  {veiculos.map((veiculo) => (
                    <MenuItem key={veiculo.id} value={veiculo.id}>
                      {veiculo.placa} - {veiculo.modelo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Cadastrar Rota
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CadastroRotaPage;
