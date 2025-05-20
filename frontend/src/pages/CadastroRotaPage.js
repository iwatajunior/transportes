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
  CircularProgress,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import api from '../services/api';
import { getCidadesPI } from '../services/cidadesPI';

const CadastroRotaPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    identificacao: '',
    cidadeOrigem: '',
    cidadeDestino: '',
    cidadesIntermediariasIda: [],
    cidadesIntermediariasVolta: [],
    dataSaida: '',
    horarioSaida: '',
    dataRetorno: '',
    horarioRetorno: ''
  });

  const [cidades, setCidades] = useState([]);
  const [selectedCidadeIda, setSelectedCidadeIda] = useState('');
  const [selectedCidadeVolta, setSelectedCidadeVolta] = useState('');

  useEffect(() => {
    // Carregar cidades do Piauí
    const cidadesPI = getCidadesPI();
    setCidades(cidadesPI);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCidadeIda = () => {
    if (selectedCidadeIda && !formData.cidadesIntermediariasIda.includes(selectedCidadeIda)) {
      setFormData(prev => ({
        ...prev,
        cidadesIntermediariasIda: [...prev.cidadesIntermediariasIda, selectedCidadeIda]
      }));
      setSelectedCidadeIda('');
    }
  };

  const handleAddCidadeVolta = () => {
    if (selectedCidadeVolta && !formData.cidadesIntermediariasVolta.includes(selectedCidadeVolta)) {
      setFormData(prev => ({
        ...prev,
        cidadesIntermediariasVolta: [...prev.cidadesIntermediariasVolta, selectedCidadeVolta]
      }));
      setSelectedCidadeVolta('');
    }
  };

  const handleRemoveCidadeIda = (cidadeId) => {
    setFormData(prev => ({
      ...prev,
      cidadesIntermediariasIda: prev.cidadesIntermediariasIda.filter(id => id !== cidadeId)
    }));
  };

  const handleRemoveCidadeVolta = (cidadeId) => {
    setFormData(prev => ({
      ...prev,
      cidadesIntermediariasVolta: prev.cidadesIntermediariasVolta.filter(id => id !== cidadeId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar se cidade de origem e destino são diferentes
      if (formData.cidadeOrigem === formData.cidadeDestino) {
        throw new Error('A cidade de origem não pode ser igual à cidade de destino.');
      }

      // Validar se data de retorno é maior que data de saída
      const dataSaida = new Date(`${formData.dataSaida} ${formData.horarioSaida}`);
      const dataRetorno = new Date(`${formData.dataRetorno} ${formData.horarioRetorno}`);
      if (dataRetorno <= dataSaida) {
        throw new Error('A data de retorno deve ser posterior à data de saída.');
      }

      // Preparar dados para envio
      const rotaData = {
        identificacao: formData.identificacao,
        cidadeOrigem: formData.cidadeOrigem,
        cidadeDestino: formData.cidadeDestino,
        cidadesIntermediariasIda: formData.cidadesIntermediariasIda,
        cidadesIntermediariasVolta: formData.cidadesIntermediariasVolta,
        dataSaida: format(new Date(`${formData.dataSaida} ${formData.horarioSaida}`), 'yyyy-MM-dd HH:mm:ss'),
        dataRetorno: format(new Date(`${formData.dataRetorno} ${formData.horarioRetorno}`), 'yyyy-MM-dd HH:mm:ss')
      };

      // Enviar para a API
      await api.post('/routes', rotaData);
      setSuccess('Rota cadastrada com sucesso!');
      // Limpar formulário após sucesso
      setFormData({
        identificacao: '',
        cidadeOrigem: '',
        cidadeDestino: '',
        cidadesIntermediariasIda: [],
        cidadesIntermediariasVolta: [],
        dataSaida: '',
        horarioSaida: '',
        dataRetorno: '',
        horarioRetorno: ''
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

  // Função para filtrar cidades disponíveis para seleção
  const getCidadesDisponiveis = (tipo) => {
    return cidades.filter(cidade => {
      const id = cidade.id;
      if (tipo === 'ida') {
        return id !== formData.cidadeOrigem && 
               id !== formData.cidadeDestino && 
               !formData.cidadesIntermediariasIda.includes(id);
      } else {
        return id !== formData.cidadeOrigem && 
               id !== formData.cidadeDestino && 
               !formData.cidadesIntermediariasVolta.includes(id);
      }
    });
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 'bold',
            color: 'primary.main'
          }}>
            Cadastro de Rota
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Identificação da Rota */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Identificação da Rota"
                  name="identificacao"
                  value={formData.identificacao}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Rota Teresina-Picos"
                  helperText="Digite um nome ou código para identificar esta rota"
                />
              </Grid>

              {/* Cidade de Origem */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Cidade de Origem</InputLabel>
                  <Select
                    name="cidadeOrigem"
                    value={formData.cidadeOrigem}
                    onChange={handleInputChange}
                    label="Cidade de Origem"
                  >
                    {cidades.map((cidade) => (
                      <MenuItem key={cidade.id} value={cidade.id}>
                        {cidade.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Cidade de Destino */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Cidade de Destino</InputLabel>
                  <Select
                    name="cidadeDestino"
                    value={formData.cidadeDestino}
                    onChange={handleInputChange}
                    label="Cidade de Destino"
                  >
                    {cidades.map((cidade) => (
                      <MenuItem key={cidade.id} value={cidade.id}>
                        {cidade.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Cidades Intermediárias - Ida */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Cidades Intermediárias - Percurso de Ida
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <FormControl fullWidth>
                        <InputLabel>Adicionar Cidade Intermediária</InputLabel>
                        <Select
                          value={selectedCidadeIda}
                          onChange={(e) => setSelectedCidadeIda(e.target.value)}
                          label="Adicionar Cidade Intermediária"
                        >
                          {getCidadesDisponiveis('ida').map((cidade) => (
                            <MenuItem key={cidade.id} value={cidade.id}>
                              {cidade.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="contained"
                        onClick={handleAddCidadeIda}
                        disabled={!selectedCidadeIda}
                        fullWidth
                        sx={{ height: '56px' }}
                      >
                        Adicionar Cidade
                      </Button>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.cidadesIntermediariasIda.map((cidadeId) => {
                      const cidade = cidades.find(c => c.id === cidadeId);
                      return cidade && (
                        <Chip
                          key={cidade.id}
                          label={cidade.nome}
                          onDelete={() => handleRemoveCidadeIda(cidade.id)}
                          color="primary"
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                </Box>
              </Grid>

              {/* Cidades Intermediárias - Volta */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Cidades Intermediárias - Percurso de Volta
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <FormControl fullWidth>
                        <InputLabel>Adicionar Cidade Intermediária</InputLabel>
                        <Select
                          value={selectedCidadeVolta}
                          onChange={(e) => setSelectedCidadeVolta(e.target.value)}
                          label="Adicionar Cidade Intermediária"
                        >
                          {getCidadesDisponiveis('volta').map((cidade) => (
                            <MenuItem key={cidade.id} value={cidade.id}>
                              {cidade.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="contained"
                        onClick={handleAddCidadeVolta}
                        disabled={!selectedCidadeVolta}
                        fullWidth
                        sx={{ height: '56px' }}
                      >
                        Adicionar Cidade
                      </Button>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.cidadesIntermediariasVolta.map((cidadeId) => {
                      const cidade = cidades.find(c => c.id === cidadeId);
                      return cidade && (
                        <Chip
                          key={cidade.id}
                          label={cidade.nome}
                          onDelete={() => handleRemoveCidadeVolta(cidade.id)}
                          color="primary"
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
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
        </Box>
      </Paper>
    </Container>
  );
};

export default CadastroRotaPage;
