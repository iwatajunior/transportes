import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import axios from 'axios';

const VehicleForm = ({ onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        placa: initialData.placa || '',
        marca: initialData.marca || '',
        modelo: initialData.modelo || '',
        ano: initialData.ano || '',
        tipo: initialData.tipo || 'Carro',
        capacidade: initialData.capacidade || '',
        tipo_uso: initialData.tipo_uso || '',
        quilometragematual: initialData.quilometragematual || '',
        observacoes: initialData.observacoes || '',
        status: initialData.status || 'Disponível'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData(prevData => ({
                ...prevData,
                placa: initialData.placa || '',
                marca: initialData.marca || '',
                modelo: initialData.modelo || '',
                ano: initialData.ano || '',
                tipo: initialData.tipo || 'Carro',
                capacidade: initialData.capacidade || '',
                tipo_uso: initialData.tipo_uso || '',
                quilometragematual: initialData.quilometragematual || '',
                observacoes: initialData.observacoes || '',
                status: initialData.status || 'Disponível'
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // Garantir que os campos numéricos sejam números
            const dataToSubmit = {
                ...formData,
                ano: parseInt(formData.ano, 10),
                capacidade: parseInt(formData.capacidade, 10),
                quilometragematual: parseInt(formData.quilometragematual, 10),
                tipo_uso: formData.tipo_uso || null,
                observacoes: formData.observacoes || null,
                placa: formData.placa.toUpperCase().replace(/-/g, '') // Remove hífen e converte para maiúsculas
            };
            await onSubmit(dataToSubmit);
        } catch (err) {
            setError(err.message || 'Falha ao submeter o formulário');
        } finally {
            setIsLoading(false);
        }
    };

    const vehicleTypes = ['Carro', 'Van', 'Ônibus', 'Moto'];
    const usageTypes = ['Carga', 'Passeio', 'Misto'];
    const statusTypes = ['Disponível', 'Em Manutenção', 'Em Viagem', 'Indisponível'];

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="placa"
                        name="placa"
                        label="Placa"
                        value={formData.placa}
                        onChange={handleChange}
                        autoFocus
                        inputProps={{ maxLength: 8 }}
                        helperText="Formato: AAA-1234 ou AAA1B34"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="marca"
                        name="marca"
                        label="Marca"
                        value={formData.marca}
                        onChange={handleChange}
                        inputProps={{ minLength: 2, maxLength: 50 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="modelo"
                        name="modelo"
                        label="Modelo"
                        value={formData.modelo}
                        onChange={handleChange}
                        inputProps={{ minLength: 1, maxLength: 50 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="ano"
                        name="ano"
                        label="Ano"
                        type="number"
                        value={formData.ano}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel id="tipo-label">Tipo de Veículo</InputLabel>
                        <Select
                            labelId="tipo-label"
                            id="tipo"
                            name="tipo"
                            value={formData.tipo}
                            label="Tipo de Veículo"
                            onChange={handleChange}
                        >
                            {vehicleTypes.map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel id="tipo_uso-label">Tipo de Uso</InputLabel>
                        <Select
                            labelId="tipo_uso-label"
                            id="tipo_uso"
                            name="tipo_uso"
                            value={formData.tipo_uso}
                            label="Tipo de Uso"
                            onChange={handleChange}
                        >
                            <MenuItem value=""><em>Nenhum / Não especificado</em></MenuItem>
                            {usageTypes.map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="capacidade"
                        name="capacidade"
                        label="Capacidade"
                        type="number"
                        value={formData.capacidade}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 1, max: 100 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="quilometragematual"
                        name="quilometragematual"
                        label="Quilometragem Atual"
                        type="number"
                        value={formData.quilometragematual}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 0 } }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="observacoes"
                        name="observacoes"
                        label="Observações"
                        multiline
                        rows={4}
                        value={formData.observacoes}
                        onChange={handleChange}
                        inputProps={{ maxLength: 500 }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="status-label">Status do Veículo</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status"
                            name="status"
                            value={formData.status}
                            label="Status do Veículo"
                            onChange={handleChange}
                        >
                            {statusTypes.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={isLoading}
                        sx={{ mt: 2 }}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Cadastrar Veículo'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default VehicleForm;
