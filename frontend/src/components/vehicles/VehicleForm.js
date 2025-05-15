
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
    Alert,
    Switch, // Adicionado
    FormControlLabel // Adicionado
} from '@mui/material';

// Simulating fetching current user ID (e.g., from context or auth service)
// Replace this with your actual user ID fetching logic
const getCurrentUserId = async () => {
    // Placeholder: In a real app, this would come from your auth system
    return 1; // Assuming user ID 1 for now (e.g., a manager)
};

const VehicleForm = ({ onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        placa: initialData.placa || '',
        marca: initialData.marca || '',
        modelo: initialData.modelo || '',
        ano_fabricacao: initialData.ano_fabricacao || '',
        tipo_veiculo: initialData.tipo_veiculo || 'Carro', // Default to 'Carro'
        tipo_uso: initialData.tipo_uso || '',
        capacidade_passageiros: initialData.capacidade_passageiros || '',
        km_atual: initialData.km_atual || '',
        data_ultima_revisao: initialData.data_ultima_revisao || '',
        data_proxima_revisao: initialData.data_proxima_revisao || '',
        observacoes: initialData.observacoes || '',
        usuario_responsavel_id: initialData.usuario_responsavel_id || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isVehicleActive, setIsVehicleActive] = useState(true); // Estado para o switch Ativo/Inativo

    useEffect(() => {
        let isMounted = true; // Flag para rastrear se o componente está montado

        // Lógica para usuario_responsavel_id
        if (!initialData.veiculoid) { // Apenas se for um novo veículo
            const fetchUserId = async () => {
                try {
                    const userId = await getCurrentUserId();
                    if (isMounted) { // Só atualiza o estado se ainda estiver montado
                        setFormData(prevData => ({ ...prevData, usuario_responsavel_id: userId }));
                    }
                } catch (err) {
                    // Opcional: só logar erro se montado, ou sempre logar
                    // if (isMounted) { console.error("Failed to fetch user ID", err); }
                    // Por ora, vamos manter o log do erro independentemente do estado de montagem,
                    // pois o erro em si ainda pode ser relevante.
                    console.error("Failed to fetch user ID", err);
                }
            };
            fetchUserId();
        }

        // Lógica para o status do veículo (isVehicleActive) - síncrona, não precisa de isMounted aqui
        // Esta parte é síncrona em relação ao useEffect, então isMounted não é estritamente necessário para ela,
        // mas as chamadas setIsVehicleActive em si devem ocorrer apenas se o componente estiver montado.
        // No entanto, como o React lida com chamadas setState em componentes desmontados de forma graciosa (no-op com warning),
        // e esta parte não envolve uma promise longa, o risco é menor.
        // Para consistência, poderíamos adicionar if (isMounted) antes de cada setIsVehicleActive,
        // mas vamos focar no async fetchUserId que é a causa mais provável do warning.
        if (initialData && typeof initialData.status !== 'undefined') {
            if (isMounted) setIsVehicleActive(initialData.status === 'Disponível');
        } else {
            if (isMounted) setIsVehicleActive(true);
        }

        return () => { // Função de limpeza
            isMounted = false; // Define como falso quando o componente desmontar
        };
    }, [initialData]); // Depende de initialData para reavaliar quando ele mudar

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value, // MUI TextField type=number handles conversion internally for display
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const dataToSubmit = {
                ...formData,
                ano_fabricacao: formData.ano_fabricacao ? parseInt(formData.ano_fabricacao, 10) : null,
                capacidade_passageiros: formData.capacidade_passageiros ? parseInt(formData.capacidade_passageiros, 10) : null,
                km_atual: formData.km_atual ? parseInt(formData.km_atual, 10) : null,
                data_ultima_revisao: formData.data_ultima_revisao || null,
                data_proxima_revisao: formData.data_proxima_revisao || null,
                observacoes: formData.observacoes || null,
                tipo_uso: formData.tipo_uso || null,
                // usuario_responsavel_id is already in formData
                status: isVehicleActive ? 'Disponível' : 'Indisponível', // Adicionar status com base no switch
            };
            await onSubmit(dataToSubmit);
        } catch (err) {
            setError(err.message || 'Falha ao submeter o formulário');
        } finally {
            setIsLoading(false);
        }
    };

    const vehicleTypes = ['Carro', 'Van', 'Ônibus', 'Moto']; // Valores correspondentes ao ENUM tipo_veiculo no banco de dados
    const usageTypes = ['Carga', 'Passeio', 'Misto']; // Valores correspondentes aos tipos de uso permitidos no schema de validação

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
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
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="ano_fabricacao"
                        name="ano_fabricacao"
                        label="Ano de Fabricação"
                        type="number"
                        value={formData.ano_fabricacao}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel id="tipo_veiculo-label">Tipo de Veículo</InputLabel>
                        <Select
                            labelId="tipo_veiculo-label"
                            id="tipo_veiculo"
                            name="tipo_veiculo"
                            value={formData.tipo_veiculo}
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
                        id="capacidade_passageiros"
                        name="capacidade_passageiros"
                        label="Capacidade de Passageiros"
                        type="number"
                        value={formData.capacidade_passageiros}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 1 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        id="km_atual"
                        name="km_atual"
                        label="Quilometragem Atual"
                        type="number"
                        value={formData.km_atual}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 0 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="data_ultima_revisao"
                        name="data_ultima_revisao"
                        label="Data da Última Revisão"
                        type="date"
                        value={formData.data_ultima_revisao}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="data_proxima_revisao"
                        name="data_proxima_revisao"
                        label="Data da Próxima Revisão"
                        type="date"
                        value={formData.data_proxima_revisao}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
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
                    />
                </Grid>


            {/* Switch para Ativar/Inativar Veículo */}
            <Grid item xs={12}>
                <FormControlLabel
                    control={<Switch checked={isVehicleActive} onChange={(e) => setIsVehicleActive(e.target.checked)} name="isVehicleActive" />}
                    label={isVehicleActive ? "Veículo Ativo" : "Veículo Inativo"}
                />
            </Grid>

            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isLoading ? 'Salvando...' : (initialData.veiculoid ? 'Atualizar Veículo' : 'Salvar Veículo')}
                </Button>
            </Grid> {/* Fecha o Grid item dos botões */}
        </Grid> {/* Fecha o Grid container principal */}
    </Box> /* Fecha o Box do formulário */
);
};

export default VehicleForm;
