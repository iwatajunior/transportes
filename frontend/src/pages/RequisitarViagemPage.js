import React, { useState, useEffect } from 'react';
import { Typography, Container, Paper, TextField, Button, Grid, Box, Alert } from '@mui/material'; // Adicionado Alert
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { jwtDecode } from 'jwt-decode'; // Para obter o ID do requisitante
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const RequisitarViagemPage = () => {
    const history = useHistory();
    const [formData, setFormData] = useState({
        destino: '',
        motivo: '',
        dataHoraSaida: null,
        dataHoraRetorno: null,
        numPassageiros: 1,
        // idRequisitante será preenchido automaticamente
    });
    const [idRequisitante, setIdRequisitante] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setIdRequisitante(decodedToken.userId); // Assumindo que o ID do usuário está em 'userId' no token
            } catch (e) {
                console.error('Erro ao decodificar token:', e);
                setError('Erro ao obter informações do usuário. Faça login novamente.');
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleDateChange = (name, date) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: date
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!idRequisitante) {
            setError('Não foi possível identificar o requisitante. Faça login novamente.');
            return;
        }

        if (!formData.dataHoraSaida || !formData.dataHoraRetorno) {
            setError('Datas e horas de saída e retorno são obrigatórias.');
            return;
        }

        if (formData.dataHoraRetorno <= formData.dataHoraSaida) {
            setError('A data/hora de retorno deve ser posterior à data/hora de saída.');
            return;
        }

        const payload = {
            ...formData,
            idRequisitante: idRequisitante,
            // O status será definido pelo backend, geralmente como 'PENDENTE' ou 'SOLICITADA'
        };

        try {
            // const response = await axios.post('/api/viagens/requisitar', payload, {
            //     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            // });
            // console.log('Requisição de viagem enviada:', response.data);
            // setSuccess('Requisição de viagem enviada com sucesso!');
            // setTimeout(() => history.push('/'), 2000); // Redireciona após sucesso
            
            // Placeholder para simular sucesso até o backend estar pronto
            console.log('Payload da requisição:', payload);
            setSuccess('Simulação: Requisição de viagem enviada com sucesso! (Frontend placeholder)');
            // Limpar formulário (opcional)
            // setFormData({
            //     destino: '',
            //     motivo: '',
            //     dataHoraSaida: null,
            //     dataHoraRetorno: null,
            //     numPassageiros: 1,
            // });

        } catch (err) {
            console.error('Erro ao requisitar viagem:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Erro ao enviar requisição de viagem. Tente novamente.');
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontFamily: "'Exo 2', sans-serif" }}>
                        Requisitar Nova Viagem
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="destino"
                                    label="Destino"
                                    name="destino"
                                    value={formData.destino}
                                    onChange={handleChange}
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="motivo"
                                    label="Motivo da Viagem"
                                    name="motivo"
                                    multiline
                                    rows={4}
                                    value={formData.motivo}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DateTimePicker
                                    label="Data e Hora de Saída"
                                    value={formData.dataHoraSaida}
                                    onChange={(newValue) => handleDateChange('dataHoraSaida', newValue)}
                                    renderInput={(params) => <TextField {...params} required fullWidth name="dataHoraSaida" />}
                                    minDateTime={new Date()} // Não permite selecionar datas/horas passadas
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DateTimePicker
                                    label="Data e Hora de Retorno"
                                    value={formData.dataHoraRetorno}
                                    onChange={(newValue) => handleDateChange('dataHoraRetorno', newValue)}
                                    renderInput={(params) => <TextField {...params} required fullWidth name="dataHoraRetorno" />}
                                    minDateTime={formData.dataHoraSaida || new Date()} // Retorno não pode ser antes da saída
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="numPassageiros"
                                    label="Número de Passageiros"
                                    name="numPassageiros"
                                    type="number"
                                    value={formData.numPassageiros}
                                    onChange={handleChange}
                                    InputProps={{ inputProps: { min: 1 } }}
                                />
                            </Grid>
                        </Grid>
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Enviar Requisição
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </LocalizationProvider>
    );
};

export default RequisitarViagemPage;
