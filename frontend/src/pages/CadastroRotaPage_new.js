import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Paper, Typography, Box, Grid, TextField, Button, Alert, Autocomplete, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { format } from 'date-fns';
import api from '../../services/api';

const CadastroRotaPage = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    cidadeOrigem: '',
    cidadeDestino: '',
    cidadesIntermediariasIda: [],
    cidadesIntermediariasVolta: [],
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
  const [selectedCidadeIda, setSelectedCidadeIda] = useState(null);
  const [selectedCidadeVolta, setSelectedCidadeVolta] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cidadesResponse, motoristasResponse, veiculosResponse] = await Promise.all([
          api.get('/cidades'),
          api.get('/motoristas'),
          api.get('/veiculos')
        ]);
        setCidades(cidadesResponse.data);
        setMotoristas(motoristasResponse.data);
        setVeiculos(veiculosResponse.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validar cidades
      if (formData.cidadeOrigem === formData.cidadeDestino) {
        throw new Error('A cidade de origem não pode ser igual à cidade de destino.');
      }

      // Validar datas e horários
      const dataSaida = new Date(`${formData.dataSaida} ${formData.horarioSaida}`);
      const dataRetorno = new Date(`${formData.dataRetorno} ${formData.horarioRetorno}`);
      if (dataRetorno <= dataSaida) {
        throw new Error('A data de retorno deve ser posterior à data de saída.');
      }

      // Validar motorista e veículo
      if (!formData.motorista || !formData.veiculo) {
        throw new Error('Selecione um motorista e um veículo.');
      }

      // Preparar dados para envio
      const rotaData = {
        ...formData,
        dataSaida: format(dataSaida, 'yyyy-MM-dd HH:mm:ss'),
        dataRetorno: format(dataRetorno, 'yyyy-MM-dd HH:mm:ss')
      };

      // Enviar para a API
      await api.post('/rotas', rotaData);
      setSuccess('Rota cadastrada com sucesso!');
      setTimeout(() => history.push('/'), 2000);
    } catch (err) {
      console.error('Erro ao cadastrar rota:', err);
      setError(err.response?.data?.message || 'Erro ao cadastrar rota. Tente novamente.');
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

        <form onSubmit={handleSubmit}>
          {/* Seção de Dados da Rota */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Dados da Rota
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={cidades}
                getOptionLabel={(option) => option.nome}
                value={cidades.find(c => c.id === formData.cidadeOrigem) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData(prev => ({
                      ...prev,
                      cidadeOrigem: newValue.id
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cidade de Origem"
                    required
                    fullWidth
                    error={!formData.cidadeOrigem}
                    helperText={!formData.cidadeOrigem ? 'Campo obrigatório' : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={cidades}
                getOptionLabel={(option) => option.nome}
                value={cidades.find(c => c.id === formData.cidadeDestino) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData(prev => ({
                      ...prev,
                      cidadeDestino: newValue.id
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cidade de Destino"
                    required
                    fullWidth
                    error={!formData.cidadeDestino}
                    helperText={!formData.cidadeDestino ? 'Campo obrigatório' : ''}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Seção de Cidades Intermediárias */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Cidades Intermediárias
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">
                  Percurso de Ida
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {formData.cidadesIntermediariasIda.length} cidades selecionadas
                </Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel>Selecione uma cidade intermediária</InputLabel>
                <Select
                  value={selectedCidadeIda}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value);
                    setSelectedCidadeIda(selectedId);
                  }}
                >
                  {cidades
                    .filter(c => 
                      c.id !== formData.cidadeOrigem && 
                      c.id !== formData.cidadeDestino && 
                      !formData.cidadesIntermediariasIda.includes(c.id)
                    )
                    .map((cidade) => (
                      <MenuItem key={cidade.id} value={cidade.id}>
                        {cidade.nome}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => {
                  if (selectedCidadeIda) {
                    setFormData(prev => ({
                      ...prev,
                      cidadesIntermediariasIda: [...prev.cidadesIntermediariasIda, selectedCidadeIda]
                    }));
                    setSelectedCidadeIda(null);
                  }
                }}
                disabled={!selectedCidadeIda}
                sx={{ mt: 1 }}
              >
                Adicionar Cidade
              </Button>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.cidadesIntermediariasIda.map((cidadeId) => {
                  const cidade = cidades.find(c => c.id === cidadeId);
                  return (
                    cidade && (
                      <Chip
                        key={cidade.id}
                        label={cidade.nome}
                        onDelete={() => {
                          setFormData(prev => ({
                            ...prev,
                            cidadesIntermediariasIda: prev.cidadesIntermediariasIda.filter(id => id !== cidade.id)
                          }));
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )
                  );
                })}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 2 }}>
                <Typography variant="subtitle1">
                  Percurso de Volta
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {formData.cidadesIntermediariasVolta.length} cidades selecionadas
                </Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel>Selecione uma cidade intermediária</InputLabel>
                <Select
                  value={selectedCidadeVolta}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value);
                    setSelectedCidadeVolta(selectedId);
                  }}
                >
                  {cidades
                    .filter(c => 
                      c.id !== formData.cidadeOrigem && 
                      c.id !== formData.cidadeDestino && 
                      !formData.cidadesIntermediariasVolta.includes(c.id)
                    )
                    .map((cidade) => (
                      <MenuItem key={cidade.id} value={cidade.id}>
                        {cidade.nome}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => {
                  if (selectedCidadeVolta) {
                    setFormData(prev => ({
                      ...prev,
                      cidadesIntermediariasVolta: [...prev.cidadesIntermediariasVolta, selectedCidadeVolta]
                    }));
                    setSelectedCidadeVolta(null);
                  }
                }}
                disabled={!selectedCidadeVolta}
                sx={{ mt: 1 }}
              >
                Adicionar Cidade
              </Button>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.cidadesIntermediariasVolta.map((cidadeId) => {
                  const cidade = cidades.find(c => c.id === cidadeId);
                  return (
                    cidade && (
                      <Chip
                        key={cidade.id}
                        label={cidade.nome}
                        onDelete={() => {
                          setFormData(prev => ({
                            ...prev,
                            cidadesIntermediariasVolta: prev.cidadesIntermediariasVolta.filter(id => id !== cidade.id)
                          }));
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )
                  );
                })}
              </Box>
            </Grid>
          </Grid>

          {/* Seção de Datas e Horários */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Datas e Horários
          </Typography>
          <Grid container spacing={3}>
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
                error={!formData.dataSaida}
                helperText={!formData.dataSaida ? 'Campo obrigatório' : ''}
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
                error={!formData.horarioSaida}
                helperText={!formData.horarioSaida ? 'Campo obrigatório' : ''}
              />
            </Grid>
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
                error={!formData.dataRetorno}
                helperText={!formData.dataRetorno ? 'Campo obrigatório' : ''}
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
                error={!formData.horarioRetorno}
                helperText={!formData.horarioRetorno ? 'Campo obrigatório' : ''}
              />
            </Grid>
          </Grid>

          {/* Seção de Motorista e Veículo */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Motorista e Veículo
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Motorista</InputLabel>
                <Select
                  name="motorista"
                  value={formData.motorista || ''}
                  onChange={handleInputChange}
                  label="Motorista"
                  required
                  error={!formData.motorista}
                >
                  <MenuItem value="">Selecione um motorista</MenuItem>
                  {motoristas.map((motorista) => (
                    <MenuItem key={motorista.id} value={motorista.id}>
                      {motorista.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Veículo</InputLabel>
                <Select
                  name="veiculo"
                  value={formData.veiculo || ''}
                  onChange={handleInputChange}
                  label="Veículo"
                  required
                  error={!formData.veiculo}
                >
                  <MenuItem value="">Selecione um veículo</MenuItem>
                  {veiculos.map((veiculo) => (
                    <MenuItem key={veiculo.id} value={veiculo.id}>
                      {veiculo.model} - {veiculo.plate}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Botão de Submit */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{
                px: 4,
                height: 48,
                fontSize: '1rem'
              }}
            >
              Cadastrar Rota
            </Button>
          </Box>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default CadastroRotaPage;
