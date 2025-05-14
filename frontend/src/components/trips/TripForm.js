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

const tipoVeiculoOptions = ['Passeio', 'Carga', 'Misto', 'Van', 'Ônibus', 'Outro']; 

const TripForm = ({ onSubmit, isLoading, initialData = {}, isEditMode = false }) => {
    const [formData, setFormData] = useState({
        data_saida: null,
        horario_saida: null,
        data_retorno_prevista: null,
        horario_retorno_previsto: null,
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
                    '& .MuiTextField-root, & .MuiFormControl-root': {
                        backgroundColor: '#fff'
                    },
                    '& .MuiInputLabel-root': {
                        color: theme => theme.palette.text.secondary
                    },
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: theme => theme.palette.primary.main,
                        },
                    }
                }}
            >
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                                <DatePicker
                                    label="Data da Saída *"
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
                                                    borderRadius: 1,
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
                                    label="Horário da Saída *"
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
                                                    borderRadius: 1,
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
                                    label="Data de Retorno *"
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
                                                    borderRadius: 1,
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
                                    label="Horário de Retorno *"
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
                                                    borderRadius: 1,
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
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="destino_completo"
                            name="destino_completo"
                            label="Destino"
                            multiline
                            rows={2}
                            value={formData.destino_completo}
                            onChange={handleInputChange}
                            error={!!formErrors.destino_completo}
                            helperText={formErrors.destino_completo}
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
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="finalidade"
                            name="finalidade"
                            label="Finalidade"
                            multiline
                            rows={2}
                            value={formData.finalidade}
                            onChange={handleInputChange}
                            error={!!formErrors.finalidade}
                            helperText={formErrors.finalidade}
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
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="quantidade_passageiros"
                            name="quantidade_passageiros"
                            label="Nº de Passageiros"
                            type="number"
                            value={formData.quantidade_passageiros}
                            onChange={handleInputChange}
                            error={!!formErrors.quantidade_passageiros}
                            helperText={formErrors.quantidade_passageiros}
                            InputProps={{ inputProps: { min: 1 } }}
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
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={!!formErrors.tipo_veiculo_desejado}>
                            <InputLabel>Tipo de Veículo</InputLabel>
                            <Select
                                value={formData.tipo_veiculo_desejado}
                                label="Tipo de Veículo"
                                name="tipo_veiculo_desejado"
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        borderRadius: 1,
                                        backgroundColor: '#fff',
                                        '&:hover': {
                                            backgroundColor: '#f8f9fa'
                                        }
                                    }
                                }}
                            >
                                {tipoVeiculoOptions.map((tipo) => (
                                    <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                                ))}
                            </Select>
                            {formErrors.tipo_veiculo_desejado && (
                                <FormHelperText>{formErrors.tipo_veiculo_desejado}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="observacoes"
                            name="observacoes"
                            label="Observações"
                            multiline
                            rows={3}
                            value={formData.observacoes}
                            onChange={handleInputChange}
                            error={!!formErrors.observacoes}
                            helperText={formErrors.observacoes}
                        />
                    </Grid>
                </Grid>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    mt: 4,
                    mb: 2
                }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        size="large"
                        sx={{ 
                            minWidth: 200,
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            boxShadow: 2,
                            '&:hover': {
                                boxShadow: 4
                            }
                        }}
                    >
                        {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} color="inherit" />
                                <span>Processando...</span>
                            </Box>
                        ) : (
                            isEditMode ? 'Salvar Alterações' : 'Registrar Viagem'
                        )}
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
};


export default TripForm;
