import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Grid,
    Box,
    CircularProgress,
    Typography 
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ptBR } from 'date-fns/locale'; 

// NOTA: O banco de dados tem um ENUM chamado status_tipo_veiculo_enum que aceita apenas certos valores
// O erro indica que 'Van' não é aceito, então voltamos aos valores anteriores que funcionavam
// Esses valores devem corresponder ao ENUM status_tipo_veiculo_enum no banco de dados
const tipoVeiculoOptions = ['Passeio', 'Carga', 'Misto']; // Valores aceitos pelo banco de dados

const TripForm = ({ onSubmit, isLoading, initialData = {}, isEditMode = false }) => {
    const [formData, setFormData] = useState({
        data_saida: null,
        horario_saida: null,
        data_retorno_prevista: null,
        horario_retorno_previsto: null,
        origem: '',
        destino_completo: '',
        finalidade: '',
        quantidade_passageiros: 1,
        tipo_veiculo_desejado: tipoVeiculoOptions[0],
        observacoes: '',
        ...initialData, 
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            const updatedFormData = { ...initialData };
            if (initialData.data_saida) {
                updatedFormData.data_saida = new Date(initialData.data_saida);
            }
            if (initialData.horario_saida) {
                const [hours, minutes] = initialData.horario_saida.split(':');
                const dateForTime = new Date();
                dateForTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                updatedFormData.horario_saida = dateForTime;
            }
            if (initialData.data_retorno_prevista) {
                updatedFormData.data_retorno_prevista = new Date(initialData.data_retorno_prevista);
            }
            if (initialData.horario_retorno_previsto) {
                const [hours, minutes] = initialData.horario_retorno_previsto.split(':');
                const dateForTime = new Date();
                dateForTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                updatedFormData.horario_retorno_previsto = dateForTime;
            }
            setFormData(prev => ({ ...prev, ...updatedFormData }));
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handlePickerChange = (name, newValue) => {
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        if (formErrors[name]) {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.data_saida) errors.data_saida = "Data de saída é obrigatória.";
        if (!formData.horario_saida) errors.horario_saida = "Horário de saída é obrigatório.";
        if (!formData.data_retorno_prevista) errors.data_retorno_prevista = "Data de retorno prevista é obrigatória.";
        else if (formData.data_saida && formData.data_retorno_prevista < formData.data_saida) {
            errors.data_retorno_prevista = "Retorno não pode ser antes da saída.";
        }
        if (!formData.horario_retorno_previsto) errors.horario_retorno_previsto = "Horário de retorno previsto é obrigatório.";
        if (formData.data_saida && formData.horario_saida && formData.data_retorno_prevista && formData.horario_retorno_previsto) {
            const saidaDateTime = new Date(formData.data_saida);
            saidaDateTime.setHours(formData.horario_saida.getHours(), formData.horario_saida.getMinutes());
            const retornoDateTime = new Date(formData.data_retorno_prevista);
            retornoDateTime.setHours(formData.horario_retorno_previsto.getHours(), formData.horario_retorno_previsto.getMinutes());
            if (retornoDateTime <= saidaDateTime) {
                errors.data_retorno_prevista = "A data/hora de retorno deve ser posterior à data/hora de saída.";
                errors.horario_retorno_previsto = "A data/hora de retorno deve ser posterior à data/hora de saída.";
            }
        }

        if (!formData.origem.trim()) errors.origem = "Origem é obrigatória.";
        if (!formData.destino_completo.trim()) errors.destino_completo = "Destino é obrigatório.";
        if (!formData.finalidade.trim()) errors.finalidade = "Finalidade é obrigatória.";
        if (formData.quantidade_passageiros < 1) errors.quantidade_passageiros = "Nº de passageiros deve ser ao menos 1.";
        if (!formData.tipo_veiculo_desejado) errors.tipo_veiculo_desejado = "Tipo de veículo é obrigatório.";
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSubmit = {
                ...formData,
                data_saida: formData.data_saida ? formData.data_saida.toISOString().split('T')[0] : null,
                horario_saida: formData.horario_saida ? `${String(formData.horario_saida.getHours()).padStart(2, '0')}:${String(formData.horario_saida.getMinutes()).padStart(2, '0')}` : null,
                data_retorno_prevista: formData.data_retorno_prevista ? formData.data_retorno_prevista.toISOString().split('T')[0] : null,
                horario_retorno_previsto: formData.horario_retorno_previsto ? `${String(formData.horario_retorno_previsto.getHours()).padStart(2, '0')}:${String(formData.horario_retorno_previsto.getMinutes()).padStart(2, '0')}` : null,
            };
            onSubmit(dataToSubmit);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box 
                component="form" 
                onSubmit={handleSubmit} 
                noValidate 
                sx={{ 
                    mt: 1,
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    boxShadow: 1,
                    p: 2,
                    '& .MuiTextField-root, & .MuiFormControl-root': {
                        backgroundColor: '#fff',
                        borderRadius: 0.5
                    },
                    '& .MuiInputLabel-root': {
                        color: theme => theme.palette.text.secondary,
                        fontSize: '0.9rem'
                    },
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: theme => theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: theme => theme.palette.primary.main,
                        },
                        fontSize: '0.9rem'
                    }
                }}
            >
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ 
                            color: theme => theme.palette.primary.main,
                            fontSize: '1rem'
                        }}>
                            Dados da Viagem
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={3}>
                                <DatePicker
                                    label="Data de Saída *"
                                    value={formData.data_saida}
                                    onChange={(newValue) => handlePickerChange('data_saida', newValue)}
                                    renderInput={(params) => 
                                        <TextField 
                                            {...params} 
                                            fullWidth 
                                            required 
                                            error={!!formErrors.data_saida} 
                                            helperText={formErrors.data_saida}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    borderRadius: 0.5,
                                                    backgroundColor: '#fff',
                                                    '&:hover': {
                                                        backgroundColor: '#f8f9fa'
                                                    }
                                                }
                                            }}
                                        />
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TimePicker
                                    label="Horário de Saída *"
                                    value={formData.horario_saida}
                                    onChange={(newValue) => handlePickerChange('horario_saida', newValue)}
                                    renderInput={(params) => 
                                        <TextField 
                                            {...params} 
                                            fullWidth 
                                            required 
                                            error={!!formErrors.horario_saida} 
                                            helperText={formErrors.horario_saida}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    borderRadius: 0.5,
                                                    backgroundColor: '#fff',
                                                    '&:hover': {
                                                        backgroundColor: '#f8f9fa'
                                                    }
                                                }
                                            }}
                                        />
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <DatePicker
                                    label="Data de Retorno Prevista *"
                                    value={formData.data_retorno_prevista}
                                    onChange={(newValue) => handlePickerChange('data_retorno_prevista', newValue)}
                                    renderInput={(params) => 
                                        <TextField 
                                            {...params} 
                                            fullWidth 
                                            required 
                                            error={!!formErrors.data_retorno_prevista} 
                                            helperText={formErrors.data_retorno_prevista}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    borderRadius: 0.5,
                                                    backgroundColor: '#fff',
                                                    '&:hover': {
                                                        backgroundColor: '#f8f9fa'
                                                    }
                                                }
                                            }}
                                        />
                                    }
                                    minDate={formData.data_saida} 
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TimePicker
                                    label="Horário de Retorno Previsto *"
                                    value={formData.horario_retorno_previsto}
                                    onChange={(newValue) => handlePickerChange('horario_retorno_previsto', newValue)}
                                    renderInput={(params) => 
                                        <TextField 
                                            {...params} 
                                            fullWidth 
                                            required 
                                            error={!!formErrors.horario_retorno_previsto} 
                                            helperText={formErrors.horario_retorno_previsto}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    borderRadius: 0.5,
                                                    backgroundColor: '#fff',
                                                    '&:hover': {
                                                        backgroundColor: '#f8f9fa'
                                                    }
                                                }
                                            }}
                                        />
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Seção de Informações da Viagem */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ 
                            color: theme => theme.palette.primary.main,
                            fontSize: '1rem'
                        }}>
                            Informações da Viagem
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Origem *"
                                    name="origem"
                                    value={formData.origem}
                                    onChange={handleInputChange}
                                    error={!!formErrors.origem}
                                    helperText={formErrors.origem}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            borderRadius: 0.5,
                                            backgroundColor: '#fff',
                                            '&:hover': {
                                                backgroundColor: '#f8f9fa'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Destino *"
                                    name="destino_completo"
                                    value={formData.destino_completo}
                                    onChange={handleInputChange}
                                    error={!!formErrors.destino_completo}
                                    helperText={formErrors.destino_completo}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            borderRadius: 0.5,
                                            backgroundColor: '#fff',
                                            '&:hover': {
                                                backgroundColor: '#f8f9fa'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Finalidade *"
                                    name="finalidade"
                                    value={formData.finalidade}
                                    onChange={handleInputChange}
                                    error={!!formErrors.finalidade}
                                    helperText={formErrors.finalidade}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            borderRadius: 0.5,
                                            backgroundColor: '#fff',
                                            '&:hover': {
                                                backgroundColor: '#f8f9fa'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Seção de Passageiros e Veículo */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ 
                            color: theme => theme.palette.primary.main,
                            fontSize: '1rem'
                        }}>
                            Requisitos da Viagem
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Quantidade de Passageiros *"
                                    name="quantidade_passageiros"
                                    type="number"
                                    value={formData.quantidade_passageiros}
                                    onChange={handleInputChange}
                                    error={!!formErrors.quantidade_passageiros}
                                    helperText={formErrors.quantidade_passageiros}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#fff',
                                            '&:hover': {
                                                backgroundColor: '#f8f9fa'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth error={!!formErrors.tipo_veiculo_desejado}>
                                    <InputLabel>Tipo de Veículo Desejado *</InputLabel>
                                    <Select
                                        name="tipo_veiculo_desejado"
                                        value={formData.tipo_veiculo_desejado}
                                        onChange={handleInputChange}
                                        label="Tipo de Veículo Desejado *"
                                    >
                                        {tipoVeiculoOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formErrors.tipo_veiculo_desejado && (
                                        <FormHelperText>{formErrors.tipo_veiculo_desejado}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Observações"
                                    name="observacoes"
                                    value={formData.observacoes}
                                    onChange={handleInputChange}
                                    error={!!formErrors.observacoes}
                                    helperText={formErrors.observacoes}
                                    multiline
                                    rows={4}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#fff',
                                            '&:hover': {
                                                backgroundColor: '#f8f9fa'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : null}
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: 1,
                            fontSize: '0.9rem',
                            '&:hover': {
                                backgroundColor: theme => theme.palette.primary.dark
                            }
                        }}
                    >
                        {isEditMode ? 'Atualizar Viagem' : 'Registrar Viagem'}
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
};


export default TripForm;
